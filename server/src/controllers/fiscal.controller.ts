import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const createInvoiceSchema = z.object({
    number: z.string().min(1),
    series: z.string().default('1'),
    type: z.enum(['NFE', 'NFCE', 'NFSE']),
    partnerId: z.string().uuid(),
    amount: z.number().positive(),
    saleId: z.string().uuid().optional(),
    notes: z.string().optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

export class FiscalController {
    // GET /api/fiscal/invoices - Listar notas fiscais
    async getAll(req: Request, res: Response) {
        try {
            const { status, type, page = '1', limit = '10' } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};
            if (status) where.status = status;
            if (type) where.type = type;

            const [invoices, total] = await Promise.all([
                prisma.invoice.findMany({
                    where,
                    include: {
                        partner: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limitNum,
                }),
                prisma.invoice.count({ where }),
            ]);

            res.json({
                data: invoices,
                meta: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar notas fiscais' });
        }
    }

    // GET /api/fiscal/invoices/:id - Buscar nota por ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: {
                    partner: true,
                },
            });

            if (!invoice) {
                return res.status(404).json({ error: 'Nota fiscal não encontrada' });
            }

            res.json(invoice);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar nota fiscal' });
        }
    }

    // POST /api/fiscal/invoices - Criar nota fiscal
    async create(req: Request, res: Response) {
        try {
            const data = createInvoiceSchema.parse(req.body);

            const invoice = await prisma.invoice.create({
                data: {
                    ...data,
                    status: 'DRAFT',
                },
                include: {
                    partner: true,
                },
            });

            res.status(201).json(invoice);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar nota fiscal' });
        }
    }

    // PUT /api/fiscal/invoices/:id - Atualizar nota fiscal
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateInvoiceSchema.parse(req.body);

            const invoice = await prisma.invoice.update({
                where: { id },
                data,
                include: {
                    partner: true,
                },
            });

            res.json(invoice);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar nota fiscal' });
        }
    }

    // POST /api/fiscal/invoices/:id/transmit - Transmitir para SEFAZ
    async transmit(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // TODO: Implementar integração real com SEFAZ
            // Por enquanto, apenas simula a transmissão

            const invoice = await prisma.invoice.update({
                where: { id },
                data: {
                    status: 'PENDING',
                },
                include: {
                    partner: true,
                },
            });

            res.json({
                message: 'Nota fiscal enviada para transmissão',
                invoice,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao transmitir nota fiscal' });
        }
    }

    // POST /api/fiscal/invoices/:id/cancel - Cancelar nota fiscal
    async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const invoice = await prisma.invoice.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                },
                include: {
                    partner: true,
                },
            });

            res.json({
                message: 'Nota fiscal cancelada com sucesso',
                invoice,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao cancelar nota fiscal' });
        }
    }

    // GET /api/fiscal/invoices/:id/xml - Baixar XML
    async getXml(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const invoice = await prisma.invoice.findUnique({
                where: { id },
                select: { xml: true },
            });

            if (!invoice || !invoice.xml) {
                return res.status(404).json({ error: 'XML não encontrado' });
            }

            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="NFe-${id}.xml"`);
            res.send(invoice.xml);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao baixar XML' });
        }
    }
}
