import { Router } from 'express';
import { getTransactions } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect transactions history
router.use(authenticate);

router.get('/', getTransactions);

export default router;
