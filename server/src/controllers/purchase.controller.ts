import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const purchaseItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
});

const purchaseSchema = z.object({
    partnerId: z.string().uuid(),
    invoiceNumber: z.string().optional(),
    invoiceSeries: z.string().optional(),
    invoiceKey: z.string().optional(),
    issueDate: z.string().optional(), // ISO Date string
    items: z.array(purchaseItemSchema).min(1),
});

export const createPurchase = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = purchaseSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Calculate total
        const total = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

        // Transaction: Create Purchase, Create Items, Update Stock, Create StockMovement
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    partnerId: data.partnerId,
                    invoiceNumber: data.invoiceNumber,
                    invoiceSeries: data.invoiceSeries,
                    invoiceKey: data.invoiceKey,
                    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
                    total,
                    status: 'COMPLETED'
                }
            });

            // Process items
            for (const item of data.items) {
                // 2. Create PurchaseItem
                await tx.purchaseItem.create({
                    data: {
                        purchaseId: purchase.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice
                    }
                });

                // 3. Update Product Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity } // Assuming stock field is 'stock' or 'stockQuantity'? 
                        // Checking schema: It is 'stock' in Product model based on previous view_file of schema.prisma
                        // WAIT. In ProductsPage.tsx usage it was 'stockQuantity' in Types, but 'stock' in Prisma?
                        // Let's re-verify schema.prisma.
                        // I will assume 'stock' based on typical schema, but need to be careful.
                        // Checking previous `view_file` of schema.prisma... 
                        // Line 38: stock Int @default(0)
                        // Line 39: categoryId String?
                        // OK, it is 'stock'.
                    }
                });

                // 4. Create StockMovement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        userId: userId,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: 'Purchase / Entrada de Nota',
                        referenceId: purchase.id
                    }
                });
            }

            return purchase;
        });

        res.status(201).json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Create Purchase Error:', error);
        res.status(500).json({ message: 'Server error creating purchase' });
    }
};

export const getPurchases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '10', partnerId } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (partnerId) where.partnerId = partnerId;

        const [purchases, total] = await Promise.all([
            prisma.purchase.findMany({
                where,
                include: {
                    partner: true,
                    items: {
                        include: { product: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.purchase.count({ where }),
        ]);

        res.json({
            data: purchases,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPurchaseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: {
                partner: true,
                items: {
                    include: { product: true }
                }
            }
        });

        if (!purchase) {
            res.status(404).json({ message: 'Purchase not found' });
            return;
        }
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
