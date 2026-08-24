import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

// Security Middleware (Helmet headers)
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps) or if allowed/Vercel/Render/Localhost domains
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { connectDB } from './config/db';
import { TradingService } from './services/tradingService';

// Ensure MongoDB is connected before handling any requests (skip OPTIONS preflight)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Cron route for Vercel Cron Job to process pending orders
app.get('/api/v1/cron/pending-orders', async (req: Request, res: Response) => {
  try {
    await TradingService.checkAndProcessPendingOrders();
    res.status(200).json({ success: true, message: 'Pending orders processed successfully' });
  } catch (error: any) {
    console.error('Cron job failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Gemini Diagnostics Route
app.get('/api/ai/test', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'GEMINI_API_KEY is not configured in backend environment variables.',
      },
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping',
      config: {
        maxOutputTokens: 5,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Gemini API is working',
      response: result.text?.trim(),
    });
  } catch (error: any) {
    const status = error.status || error.statusCode || (error.response && error.response.status) || 'UNKNOWN';
    const message = error.message || 'No error message provided';
    let category = 'configuration';
    
    if (status === 401 || status === 403 || message.toLowerCase().includes('key') || message.toLowerCase().includes('auth') || message.toLowerCase().includes('permission')) {
      category = 'authentication';
    } else if (status === 404 || message.toLowerCase().includes('model')) {
      category = 'model';
    } else if (status === 429 || message.toLowerCase().includes('quota') || message.toLowerCase().includes('limit') || message.toLowerCase().includes('rate')) {
      category = 'quota';
    }

    const httpCode = status === 'UNKNOWN' ? 500 : Number(status) || 500;
    res.status(httpCode).json({
      success: false,
      error: {
        code: 'GEMINI_API_ERROR',
        category,
        message,
        status: httpCode
      },
    });
  }
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
