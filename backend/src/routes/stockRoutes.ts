import { Router } from 'express';
import { searchStocks, getStockQuote, getStockHistory, getStockAnalysis } from '../controllers/stockController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to protect stock data access
router.use(authenticate);

router.get('/', searchStocks);
router.get('/:symbol', getStockQuote);
router.get('/:symbol/history', getStockHistory);
router.get('/:symbol/analysis', getStockAnalysis);

export default router;
