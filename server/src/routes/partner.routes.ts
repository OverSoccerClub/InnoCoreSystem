import { Router } from 'express';
import { getPartners, getPartnerById, createPartner, updatePartner, deletePartner } from '../controllers/partner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPartners);
router.get('/:id', getPartnerById);
router.post('/', createPartner);
router.put('/:id', updatePartner);
router.delete('/:id', deletePartner);

export default router;
