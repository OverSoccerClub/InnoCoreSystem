import express from 'express';
import { getCompany, saveCompany } from '../controllers/company.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorize.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/company - Get company data (any authenticated user)
router.get('/', getCompany);

// POST /api/company - Create/Update company (ADMIN only)
router.post('/', authorizeRole(['ADMIN']), saveCompany);

export default router;
