const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@innocore.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@innocore.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('📧 Email: admin@innocore.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
