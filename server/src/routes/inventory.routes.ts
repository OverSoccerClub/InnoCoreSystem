import { Router } from 'express';
import { adjustStock, getStockMovements } from '../controllers/inventory.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/movements', getStockMovements);
router.post('/adjust', adjustStock);

export default router;
