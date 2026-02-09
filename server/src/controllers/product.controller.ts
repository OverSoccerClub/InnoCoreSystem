import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    price: z.number().positive(),
    costPrice: z.number().default(0),
    sku: z.string().min(3),
    stockQuantity: z.number().int().min(0).default(0),
    categoryId: z.string().uuid().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    // Fiscal fields
    ncm: z.string().length(8, 'NCM deve ter 8 caracteres').optional(),
    cest: z.string().optional(),
    origin: z.number().int().min(0).max(2).optional().default(0),
    cfop: z.string().length(4, 'CFOP deve ter 4 caracteres').optional(),
    icmsRate: z.number().optional(),
});

const updateProductSchema = productSchema.partial();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '10',
            search = '',
            categoryId = '',
            stockFilter = 'all'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build dynamic where clause
        const where: any = {};

        // Search filter (name or SKU)
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { sku: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Category filter
        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId as string;
        }

        // Stock filter
        if (stockFilter === 'low') {
            where.stock = { gt: 0, lte: 10 };
        } else if (stockFilter === 'out') {
            where.stock = 0;
        } else if (stockFilter === 'in') {
            where.stock = { gt: 10 };
        }

        // Get total count for pagination
        const total = await prisma.product.count({ where });

        // Get paginated products
        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        });

        // Map stock to stockQuantity for frontend compatibility
        const mappedProducts = products.map(product => ({
            ...product,
            stockQuantity: product.stock,
            price: product.price.toString(),
            costPrice: product.costPrice.toString(),
            icmsRate: product.icmsRate?.toString()
        }));

        res.json({
            data: mappedProducts,
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

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = productSchema.parse(req.body);

        const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
        if (existingSku) {
            res.status(400).json({ message: 'SKU already exists' });
            return;
        }

        const { stockQuantity, ...rest } = data;

        const product = await prisma.product.create({
            data: {
                ...rest,
                stock: stockQuantity
            }
        });

        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = updateProductSchema.parse(req.body);

        const { stockQuantity, ...rest } = data;

        const updateData: any = { ...rest };
        if (stockQuantity !== undefined) {
            updateData.stock = stockQuantity;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        res.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
