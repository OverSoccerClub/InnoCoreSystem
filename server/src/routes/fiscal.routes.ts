import { Router } from 'express';
import { FiscalController } from '../controllers/fiscal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new FiscalController();

router.use(authMiddleware);

router.get('/invoices', (req, res) => controller.getAll(req, res));
router.get('/invoices/:id', (req, res) => controller.getById(req, res));
router.post('/invoices', (req, res) => controller.create(req, res));
router.put('/invoices/:id', (req, res) => controller.update(req, res));
router.post('/invoices/:id/transmit', (req, res) => controller.transmit(req, res));
router.post('/invoices/:id/cancel', (req, res) => controller.cancel(req, res));
router.get('/invoices/:id/xml', (req, res) => controller.getXml(req, res));

export default router;
