import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

// Schema for creating a sale
const createSaleSchema = z.object({
    partnerId: z.string().uuid().optional().or(z.literal('')),
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX']).default('CASH'),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
    })).min(1)
});

export const createSale = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; // Assumes authMiddleware attaches user
        const data = createSaleSchema.parse(req.body);

        // Calculate total
        const total = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

        // Transaction to ensure atomicity (create sale + decrease stock)
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sale
            const sale = await tx.sale.create({
                data: {
                    userId,
                    partnerId: data.partnerId || null,
                    paymentMethod: data.paymentMethod,
                    total,
                    status: 'COMPLETED',
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.quantity * item.unitPrice
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Update Stock for each product
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: (error as z.ZodError).issues });
            return;
        }
        console.error(error);
        res.status(500).json({ message: 'Server error processing sale' });
    }
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '10',
            status,
            startDate,
            endDate
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status;
        }

        // Date range filter
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        // Get total count
        const total = await prisma.sale.count({ where });

        // Get paginated sales
        const sales = await prisma.sale.findMany({
            where,
            include: {
                partner: true,
                user: { select: { name: true } },
                items: { include: { product: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        });

        res.json({
            data: sales,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                partner: true,
                user: { select: { name: true } },
                items: { include: { product: true } }
            }
        });

        if (!sale) {
            res.status(404).json({ message: 'Sale not found' });
            return;
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
