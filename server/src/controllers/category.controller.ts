import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '10', search } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
            where.name = { contains: search as string, mode: 'insensitive' };
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                skip,
                take: limitNum,
            }),
            prisma.category.count({ where }),
        ]);

        res.json({
            data: categories,
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

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = categorySchema.parse(req.body);

        const existing = await prisma.category.findUnique({ where: { name: data.name } });
        if (existing) {
            res.status(400).json({ message: 'Categoria já existe' });
            return;
        }

        const category = await prisma.category.create({ data });
        res.status(201).json(category);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.issues });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = categorySchema.parse(req.body);

        const category = await prisma.category.update({
            where: { id: String(id) },
            data
        });

        res.json(category);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.issues });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check for products using this category
        const productsCount = await prisma.product.count({ where: { categoryId: String(id) } });
        if (productsCount > 0) {
            res.status(400).json({ message: 'Não é possível excluir categoria com produtos vinculados' });
            return;
        }

        await prisma.category.delete({ where: { id: String(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
