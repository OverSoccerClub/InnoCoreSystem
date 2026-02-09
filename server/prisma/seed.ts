import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@innocore.com';
    const adminPassword = 'admin'; // Senha inicial simples para testes
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Administrador Sistema',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ admin });

    // ============================================
    // SEED: Plano de Contas Padrão
    // ============================================

    // Verificar se já existe plano de contas
    const existingAccounts = await prisma.chartOfAccounts.count();

    if (existingAccounts === 0) {
        console.log('Criando Plano de Contas padrão...');

        // 1. ATIVO
        const ativo = await prisma.chartOfAccounts.create({
            data: {
                code: '1',
                name: 'ATIVO',
                type: 'ASSET',
                nature: 'DEBIT',
            },
        });

        // 1.1 Ativo Circulante
        const ativoCirculante = await prisma.chartOfAccounts.create({
            data: {
                code: '1.1',
                name: 'Ativo Circulante',
                type: 'ASSET',
                nature: 'DEBIT',
                parentId: ativo.id,
            },
        });

        await prisma.chartOfAccounts.createMany({
            data: [
                { code: '1.1.01', name: 'Caixa', type: 'ASSET', nature: 'DEBIT', parentId: ativoCirculante.id },
                { code: '1.1.02', name: 'Bancos', type: 'ASSET', nature: 'DEBIT', parentId: ativoCirculante.id },
                { code: '1.1.03', name: 'Contas a Receber', type: 'ASSET', nature: 'DEBIT', parentId: ativoCirculante.id },
                { code: '1.1.04', name: 'Estoque', type: 'ASSET', nature: 'DEBIT', parentId: ativoCirculante.id },
            ],
        });

        // 1.2 Ativo Não Circulante
        const ativoNaoCirculante = await prisma.chartOfAccounts.create({
            data: {
                code: '1.2',
                name: 'Ativo Não Circulante',
                type: 'ASSET',
                nature: 'DEBIT',
                parentId: ativo.id,
            },
        });

        await prisma.chartOfAccounts.createMany({
            data: [
                { code: '1.2.01', name: 'Imobilizado', type: 'ASSET', nature: 'DEBIT', parentId: ativoNaoCirculante.id },
                { code: '1.2.02', name: 'Intangível', type: 'ASSET', nature: 'DEBIT', parentId: ativoNaoCirculante.id },
            ],
        });

        // 2. PASSIVO
        const passivo = await prisma.chartOfAccounts.create({
            data: {
                code: '2',
                name: 'PASSIVO',
                type: 'LIABILITY',
                nature: 'CREDIT',
            },
        });

        // 2.1 Passivo Circulante
        const passivoCirculante = await prisma.chartOfAccounts.create({
            data: {
                code: '2.1',
                name: 'Passivo Circulante',
                type: 'LIABILITY',
                nature: 'CREDIT',
                parentId: passivo.id,
            },
        });

        await prisma.chartOfAccounts.createMany({
            data: [
                { code: '2.1.01', name: 'Fornecedores', type: 'LIABILITY', nature: 'CREDIT', parentId: passivoCirculante.id },
                { code: '2.1.02', name: 'Contas a Pagar', type: 'LIABILITY', nature: 'CREDIT', parentId: passivoCirculante.id },
                { code: '2.1.03', name: 'Impostos a Recolher', type: 'LIABILITY', nature: 'CREDIT', parentId: passivoCirculante.id },
                { code: '2.1.04', name: 'Salários a Pagar', type: 'LIABILITY', nature: 'CREDIT', parentId: passivoCirculante.id },
            ],
        });

        // 2.2 Passivo Não Circulante
        const passivoNaoCirculante = await prisma.chartOfAccounts.create({
            data: {
                code: '2.2',
                name: 'Passivo Não Circulante',
                type: 'LIABILITY',
                nature: 'CREDIT',
                parentId: passivo.id,
            },
        });

        await prisma.chartOfAccounts.create({
            data: {
                code: '2.2.01',
                name: 'Empréstimos de Longo Prazo',
                type: 'LIABILITY',
                nature: 'CREDIT',
                parentId: passivoNaoCirculante.id,
            },
        });

        // 3. RECEITAS
        const receitas = await prisma.chartOfAccounts.create({
            data: {
                code: '3',
                name: 'RECEITAS',
                type: 'REVENUE',
                nature: 'CREDIT',
            },
        });

        await prisma.chartOfAccounts.createMany({
            data: [
                { code: '3.1', name: 'Receita de Vendas', type: 'REVENUE', nature: 'CREDIT', parentId: receitas.id },
                { code: '3.2', name: 'Receitas Financeiras', type: 'REVENUE', nature: 'CREDIT', parentId: receitas.id },
                { code: '3.3', name: 'Outras Receitas', type: 'REVENUE', nature: 'CREDIT', parentId: receitas.id },
            ],
        });

        // 4. DESPESAS
        const despesas = await prisma.chartOfAccounts.create({
            data: {
                code: '4',
                name: 'DESPESAS',
                type: 'EXPENSE',
                nature: 'DEBIT',
            },
        });

        await prisma.chartOfAccounts.createMany({
            data: [
                { code: '4.1', name: 'Despesas Operacionais', type: 'EXPENSE', nature: 'DEBIT', parentId: despesas.id },
                { code: '4.2', name: 'Despesas Financeiras', type: 'EXPENSE', nature: 'DEBIT', parentId: despesas.id },
                { code: '4.3', name: 'Despesas Administrativas', type: 'EXPENSE', nature: 'DEBIT', parentId: despesas.id },
                { code: '4.4', name: 'Custo das Mercadorias Vendidas', type: 'EXPENSE', nature: 'DEBIT', parentId: despesas.id },
            ],
        });

        console.log('✅ Plano de Contas criado com sucesso!');
    } else {
        console.log('ℹ️  Plano de Contas já existe, pulando seed...');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
