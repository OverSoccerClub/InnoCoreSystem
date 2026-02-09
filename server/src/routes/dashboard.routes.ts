import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);

export default router;
