import { Router } from 'express';
import { placeOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect order placement
router.use(authenticate);

router.post('/', placeOrder);

export default router;
