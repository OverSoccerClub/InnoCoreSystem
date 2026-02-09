import { Router } from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getDashboardStats } from '../controllers/financial.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/stats', getDashboardStats);

export default router;
