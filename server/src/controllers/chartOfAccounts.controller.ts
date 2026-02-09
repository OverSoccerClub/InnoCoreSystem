import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const createAccountSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY']),
    nature: z.enum(['DEBIT', 'CREDIT']),
    parentId: z.string().uuid().optional(),
});

const updateAccountSchema = createAccountSchema.partial();

export class ChartOfAccountsController {
    // GET /api/accounts/chart - Listar todas as contas
    async getAll(req: Request, res: Response) {
        try {
            const { active, page = '1', limit = '10', search, type, nature } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};
            if (active !== undefined) where.active = active === 'true';
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { code: { contains: search as string, mode: 'insensitive' } },
                ];
            }
            if (type) where.type = type;
            if (nature) where.nature = nature;

            const [accounts, total] = await Promise.all([
                prisma.chartOfAccounts.findMany({
                    where,
                    include: {
                        parent: true,
                        children: true,
                    },
                    orderBy: { code: 'asc' },
                    skip,
                    take: limitNum,
                }),
                prisma.chartOfAccounts.count({ where }),
            ]);

            res.json({
                data: accounts,
                meta: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar plano de contas' });
        }
    }

    // GET /api/accounts/chart/:id - Buscar conta por ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const account = await prisma.chartOfAccounts.findUnique({
                where: { id },
                include: {
                    parent: true,
                    children: true,
                },
            });

            if (!account) {
                return res.status(404).json({ error: 'Conta não encontrada' });
            }

            res.json(account);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar conta' });
        }
    }

    // POST /api/accounts/chart - Criar nova conta
    async create(req: Request, res: Response) {
        try {
            const data = createAccountSchema.parse(req.body);

            // Verificar se o código já existe
            const existing = await prisma.chartOfAccounts.findUnique({
                where: { code: data.code },
            });

            if (existing) {
                return res.status(400).json({ error: 'Código de conta já existe' });
            }

            const account = await prisma.chartOfAccounts.create({
                data,
                include: {
                    parent: true,
                },
            });

            res.status(201).json(account);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar conta' });
        }
    }

    // PUT /api/accounts/chart/:id - Atualizar conta
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateAccountSchema.parse(req.body);

            // Verificar se a conta existe
            const existing = await prisma.chartOfAccounts.findUnique({
                where: { id },
            });

            if (!existing) {
                return res.status(404).json({ error: 'Conta não encontrada' });
            }

            // Se estiver alterando o código, verificar duplicação
            if (data.code && data.code !== existing.code) {
                const codeExists = await prisma.chartOfAccounts.findUnique({
                    where: { code: data.code },
                });

                if (codeExists) {
                    return res.status(400).json({ error: 'Código de conta já existe' });
                }
            }

            const account = await prisma.chartOfAccounts.update({
                where: { id },
                data,
                include: {
                    parent: true,
                    children: true,
                },
            });

            res.json(account);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar conta' });
        }
    }

    // DELETE /api/accounts/chart/:id - Excluir conta (soft delete)
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Verificar se a conta existe
            const existing = await prisma.chartOfAccounts.findUnique({
                where: { id },
                include: {
                    children: true,
                    accountsReceivable: true,
                    accountsPayable: true,
                },
            });

            if (!existing) {
                return res.status(404).json({ error: 'Conta não encontrada' });
            }

            // Não permitir excluir se tiver filhos
            if (existing.children.length > 0) {
                return res.status(400).json({
                    error: 'Não é possível excluir conta com sub-contas vinculadas'
                });
            }

            // Não permitir excluir se tiver movimentações
            if (existing.accountsReceivable.length > 0 || existing.accountsPayable.length > 0) {
                return res.status(400).json({
                    error: 'Não é possível excluir conta com movimentações vinculadas'
                });
            }

            // Soft delete
            await prisma.chartOfAccounts.update({
                where: { id },
                data: { active: false },
            });

            res.json({ message: 'Conta desativada com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao excluir conta' });
        }
    }
}
