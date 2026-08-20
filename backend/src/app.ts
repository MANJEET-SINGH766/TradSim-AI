import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import stockRoutes from './routes/stockRoutes';
import orderRoutes from './routes/orderRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import transactionRoutes from './routes/transactionRoutes';
import watchlistRoutes from './routes/watchlistRoutes';

dotenv.config();

const app: Application = express();

// Security Middleware (Helmet headers and request rate limiters)
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP address to 100 requests per window
  skip: () => process.env.NODE_ENV === 'test', // Bypass limits during test executions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this network. Please wait 15 minutes and retry.',
    },
  },
});
app.use('/api', limiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stocks', stockRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TradeSim AI API' });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred.';
  
  res.status(status).json({
    success: false,
    error: { code, message }
  });
});

export default app;
