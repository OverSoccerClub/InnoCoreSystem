import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const adjustmentSchema = z.object({
    productId: z.string().uuid(),
    type: z.enum(['IN', 'OUT']),
    quantity: z.number().int().positive(),
    reason: z.string().min(3),
});

export const adjustStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { productId, type, quantity, reason } = adjustmentSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Stock Movement Record
            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    userId,
                    type,
                    quantity,
                    reason
                }
            });

            // 2. Update Product Stock
            const stockChange = type === 'IN' ? quantity : -quantity;

            // Check negative stock for OUT
            if (type === 'OUT') {
                const product = await tx.product.findUnique({ where: { id: productId } });
                if (!product || product.stock < quantity) {
                    throw new Error('Estoque insuficiente para esta saída.');
                }
            }

            await tx.product.update({
                where: { id: productId },
                data: {
                    stock: { increment: stockChange }
                }
            });

            return movement;
        });

        res.status(201).json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.issues });
            return;
        }
        console.error('Error in adjustStock:', error);
        res.status(400).json({ message: error.message || 'Erro ao ajustar estoque' });
    }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            productId,
            page = '1',
            limit = '10'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where = productId ? { productId: String(productId) } : {};

        // Get total count
        const total = await prisma.stockMovement.count({ where });

        // Get paginated movements
        const movements = await prisma.stockMovement.findMany({
            where,
            include: {
                product: { select: { name: true, sku: true } },
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        });

        res.json({
            data: movements,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error in getStockMovements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
