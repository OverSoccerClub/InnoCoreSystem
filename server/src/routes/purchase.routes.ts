import { Router } from 'express';
import { createPurchase, getPurchases, getPurchaseById } from '../controllers/purchase.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', createPurchase);

export default router;
