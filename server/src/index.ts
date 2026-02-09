import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import { errorHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import partnerRoutes from './routes/partner.routes';
import saleRoutes from './routes/sale.routes';
import inventoryRoutes from './routes/inventory.routes';
import financialRoutes from './routes/financial.routes';
import dashboardRoutes from './routes/dashboard.routes';
import categoryRoutes from './routes/category.routes';
import purchaseRoutes from './routes/purchase.routes';
import companyRoutes from './routes/company.routes';
import fiscalRoutes from './routes/fiscal.routes';
import chartOfAccountsRoutes from './routes/chartOfAccounts.routes';
import accountsReceivableRoutes from './routes/accountsReceivable.routes';
import accountsPayableRoutes from './routes/accountsPayable.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/accounts/chart', chartOfAccountsRoutes);
app.use('/api/accounts/receivable', accountsReceivableRoutes);
app.use('/api/accounts/payable', accountsPayableRoutes);

app.use(errorHandler);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to database');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database', error);
        process.exit(1);
    }
};

startServer();
