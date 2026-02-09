import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schema
const companySchema = z.object({
    legalName: z.string().min(1, 'Razão Social é obrigatória'),
    tradeName: z.string().optional(),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
    ie: z.string().optional(),
    im: z.string().optional(),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
    zipCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(1, 'Logradouro é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().length(2, 'UF deve conter 2 caracteres'),
    taxRegime: z.enum(['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL']),
    cnae: z.string().optional(),
    nfeEnvironment: z.enum(['PRODUCAO', 'HOMOLOGACAO']),
    nfeSeries: z.string().default('1'),
    nfeNextNumber: z.number().int().positive().default(1),
    logoUrl: z.string().optional()
});

// GET /api/company - Get company data
export const getCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const company = await prisma.company.findFirst();

        if (!company) {
            res.status(404).json({ message: 'Empresa não cadastrada' });
            return;
        }

        res.json(company);
    } catch (error) {
        console.error('Error in getCompany:', error);
        res.status(500).json({ message: 'Erro ao buscar dados da empresa' });
    }
};

// POST /api/company - Create or update company data
export const saveCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body
        const validatedData = companySchema.parse(req.body);

        // Check if company already exists
        const existingCompany = await prisma.company.findFirst();

        let company;
        if (existingCompany) {
            // Update existing company
            company = await prisma.company.update({
                where: { id: existingCompany.id },
                data: validatedData
            });
        } else {
            // Create new company
            company = await prisma.company.create({
                data: validatedData
            });
        }

        res.json(company);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: 'Dados inválidos',
                errors: error.issues
            });
            return;
        }

        console.error('Error in saveCompany:', error);
        res.status(500).json({ message: 'Erro ao salvar dados da empresa' });
    }
};
