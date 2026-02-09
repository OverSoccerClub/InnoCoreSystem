import { Router } from 'express';
import { AccountsPayableController } from '../controllers/accountsPayable.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AccountsPayableController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/stats', (req, res) => controller.getStats(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.post('/:id/pay', (req, res) => controller.pay(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
