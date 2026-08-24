import { Router } from 'express';
import { placeOrder, getPendingOrders, cancelPendingOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect order endpoints
router.use(authenticate);

router.post('/', placeOrder);
router.get('/pending', getPendingOrders);
router.delete('/pending/:id', cancelPendingOrder);

export default router;
