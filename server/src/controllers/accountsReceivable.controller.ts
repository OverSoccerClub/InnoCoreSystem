import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const createReceivableSchema = z.object({
    description: z.string().min(1),
    partnerId: z.string().uuid(),
    accountId: z.string().uuid(),
    amount: z.number().positive(),
    dueDate: z.string().datetime(),
    issueDate: z.string().datetime().optional(),
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX']).optional(),
    saleId: z.string().uuid().optional(),
    notes: z.string().optional(),
});

const updateReceivableSchema = createReceivableSchema.partial();

const payReceivableSchema = z.object({
    paidAmount: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX']),
    paidAt: z.string().datetime().optional(),
});

export class AccountsReceivableController {
    // GET /api/accounts/receivable - Listar contas a receber
    async getAll(req: Request, res: Response) {
        try {
            const { status, partnerId, page = '1', limit = '10' } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};
            if (status) where.status = status;
            if (partnerId) where.partnerId = partnerId;

            const [receivables, total] = await Promise.all([
                prisma.accountsReceivable.findMany({
                    where,
                    include: {
                        partner: true,
                        account: true,
                    },
                    orderBy: { dueDate: 'asc' },
                    skip,
                    take: limitNum,
                }),
                prisma.accountsReceivable.count({ where }),
            ]);

            res.json({
                data: receivables,
                meta: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar contas a receber' });
        }
    }

    // GET /api/accounts/receivable/stats - Estatísticas
    async getStats(req: Request, res: Response) {
        try {
            const [pending, overdue, paid, total] = await Promise.all([
                prisma.accountsReceivable.aggregate({
                    where: { status: 'PENDING' },
                    _sum: { amount: true },
                    _count: true,
                }),
                prisma.accountsReceivable.aggregate({
                    where: { status: 'OVERDUE' },
                    _sum: { amount: true },
                    _count: true,
                }),
                prisma.accountsReceivable.aggregate({
                    where: { status: 'PAID' },
                    _sum: { paidAmount: true },
                    _count: true,
                }),
                prisma.accountsReceivable.aggregate({
                    _sum: { amount: true },
                    _count: true,
                }),
            ]);

            res.json({
                pending: {
                    amount: pending._sum.amount || 0,
                    count: pending._count,
                },
                overdue: {
                    amount: overdue._sum.amount || 0,
                    count: overdue._count,
                },
                paid: {
                    amount: paid._sum.paidAmount || 0,
                    count: paid._count,
                },
                total: {
                    amount: total._sum.amount || 0,
                    count: total._count,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    }

    // POST /api/accounts/receivable - Criar conta a receber
    async create(req: Request, res: Response) {
        try {
            const data = createReceivableSchema.parse(req.body);

            const receivable = await prisma.accountsReceivable.create({
                data: {
                    ...data,
                    dueDate: new Date(data.dueDate),
                    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
                },
                include: {
                    partner: true,
                    account: true,
                },
            });

            res.status(201).json(receivable);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar conta a receber' });
        }
    }

    // PUT /api/accounts/receivable/:id - Atualizar conta a receber
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateReceivableSchema.parse(req.body);

            const receivable = await prisma.accountsReceivable.update({
                where: { id },
                data: {
                    ...data,
                    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                    issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
                },
                include: {
                    partner: true,
                    account: true,
                },
            });

            res.json(receivable);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar conta a receber' });
        }
    }

    // POST /api/accounts/receivable/:id/pay - Registrar pagamento
    async pay(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = payReceivableSchema.parse(req.body);

            const receivable = await prisma.accountsReceivable.update({
                where: { id },
                data: {
                    status: 'PAID',
                    paidAmount: data.paidAmount,
                    paymentMethod: data.paymentMethod,
                    paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                },
                include: {
                    partner: true,
                    account: true,
                },
            });

            res.json(receivable);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao registrar pagamento' });
        }
    }

    // DELETE /api/accounts/receivable/:id - Cancelar conta a receber
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await prisma.accountsReceivable.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            res.json({ message: 'Conta a receber cancelada com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao cancelar conta a receber' });
        }
    }
}
