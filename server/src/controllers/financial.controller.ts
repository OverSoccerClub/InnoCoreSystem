import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
    description: z.string().min(3),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    status: z.enum(['PENDING', 'PAID']).default('PENDING'),
    dueDate: z.string().transform(str => new Date(str)), // Expects ISO string
    paidAt: z.string().nullable().optional().transform(str => str ? new Date(str) : null),
    category: z.string(),
    partnerId: z.string().uuid().optional().or(z.literal('')),
});

const updateTransactionSchema = transactionSchema.partial();

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            type,
            status,
            startDate,
            endDate,
            page = '1',
            limit = '10'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (type) where.type = type;
        if (status) where.status = status;

        if (startDate && endDate) {
            where.dueDate = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate))
            };
        }

        // Get total count
        const total = await prisma.financialTransaction.count({ where });

        // Get paginated transactions
        const transactions = await prisma.financialTransaction.findMany({
            where,
            include: {
                partner: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { dueDate: 'asc' },
            skip,
            take: limitNum
        });

        res.json({
            data: transactions,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const data = transactionSchema.parse(req.body);

        const transaction = await prisma.financialTransaction.create({
            data: {
                ...data,
                userId,
                partnerId: data.partnerId || null
            }
        });

        res.status(201).json(transaction);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = updateTransactionSchema.parse(req.body);

        const transaction = await prisma.financialTransaction.update({
            where: { id: String(id) },
            data: {
                ...data,
                partnerId: data.partnerId || undefined // Handle undefined vs null
            }
        });

        res.json(transaction);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.financialTransaction.delete({ where: { id: String(id) } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Simple aggregate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const aggregations = await prisma.financialTransaction.groupBy({
            by: ['type', 'status'],
            where: {
                dueDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: {
                amount: true
            }
        });

        res.json(aggregations);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
