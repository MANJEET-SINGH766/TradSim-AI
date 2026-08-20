import { Router } from 'express';
import { getPortfolioSummary, getPortfolioAudit } from '../controllers/portfolioController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect portfolio access
router.use(authenticate);

router.get('/', getPortfolioSummary);
router.get('/audit', getPortfolioAudit);

export default router;
