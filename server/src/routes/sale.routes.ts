import { Router } from 'express';
import { createSale, getSales, getSaleById } from '../controllers/sale.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);

export default router;
