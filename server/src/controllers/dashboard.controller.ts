import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 1. Sales Today
        const salesToday = await prisma.sale.aggregate({
            _sum: { total: true },
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: 'COMPLETED'
            }
        });

        // 2. Monthly Revenue
        const monthlyRevenue = await prisma.sale.aggregate({
            _sum: { total: true },
            where: {
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'COMPLETED'
            }
        });

        // 3. Monthly Expenses
        const monthlyExpense = await prisma.financialTransaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'EXPENSE',
                dueDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        // 4. Low Stock Items (threshold < 10)
        const lowStockCount = await prisma.product.count({
            where: {
                stock: {
                    lt: 10
                }
            }
        });

        // 5. Recent Transactions (Sales + Expenses mixed) -> simplified: show last 5 sales
        const recentSales = await prisma.sale.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });

        // 6. Recent Financials
        const recentFinancials = await prisma.financialTransaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            where: { type: 'EXPENSE' }
        });

        // Combine and sort roughly (client can do better sorting if needed, or we just send separate lists)
        // For simplicity matching the UI "Recent Activity", we will send them as is and let UI display sales mostly.

        res.json({
            salesToday: Number(salesToday._sum.total || 0),
            monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
            monthlyExpense: Number(monthlyExpense._sum.amount || 0),
            lowStockItems: lowStockCount,
            recentSales,
            recentFinancials
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
