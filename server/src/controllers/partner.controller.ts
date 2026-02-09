import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const partnerSchema = z.object({
    name: z.string().min(3),
    fantasyName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    document: z.string().optional(), // CPF or CNPJ
    type: z.enum(['CLIENT', 'SUPPLIER']).default('CLIENT'),

    // Tax Info
    ie: z.string().optional(),
    im: z.string().optional(),

    // Address
    zipCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().length(2).optional().or(z.literal('')),

    notes: z.string().optional(),
});

const updatePartnerSchema = partnerSchema.partial();

export const getPartners = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            type,
            page = '1',
            limit = '10',
            search = ''
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        // Type filter
        if (type) {
            where.type = type as 'CLIENT' | 'SUPPLIER';
        }

        // Search filter (name, fantasyName, or document)
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { fantasyName: { contains: search as string, mode: 'insensitive' } },
                { document: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Get total count
        const total = await prisma.partner.count({ where });

        // Get paginated partners
        const partners = await prisma.partner.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limitNum
        });

        res.json({
            data: partners,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPartnerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const partner = await prisma.partner.findUnique({
            where: { id: String(id) }
        });

        if (!partner) {
            res.status(404).json({ message: 'Partner not found' });
            return;
        }
        res.json(partner);
    } catch (error) {
        console.error('Error fetching partner by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createPartner = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = partnerSchema.parse(req.body);

        if (data.document && data.document.length > 5) { // Simple check to avoid empty strings/short values
            const existing = await prisma.partner.findFirst({ where: { document: data.document } });
            if (existing) {
                res.status(400).json({ message: 'Document (CPF/CNPJ) already registered' });
                return;
            }
        }

        const partner = await prisma.partner.create({
            data
        });

        res.status(201).json(partner);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error creating partner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePartner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = updatePartnerSchema.parse(req.body);

        if (data.document && data.document.length > 5) {
            const existing = await prisma.partner.findFirst({
                where: {
                    document: data.document,
                    NOT: { id: String(id) }
                }
            });
            if (existing) {
                res.status(400).json({ message: 'Document (CPF/CNPJ) already registered' });
                return;
            }
        }

        const partner = await prisma.partner.update({
            where: { id: String(id) },
            data
        });

        res.json(partner);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error updating partner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePartner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.partner.delete({ where: { id: String(id) } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
