import { Router } from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect watchlist modifications
router.use(authenticate);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:symbol', removeFromWatchlist);

export default router;
