import { Request, Response, NextFunction } from 'express';
import { MarketService } from '../services/marketService';
import { AIAnalysis } from '../models/AIAnalysis';
import { AIService } from '../services/aiService';

/**
 * Controller to handle stock data requests
 */
export const searchStocks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.query as string;

    if (!query || query.trim() === '') {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const results = await MarketService.searchStocks(query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockQuote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SYMBOL_REQUIRED',
          message: 'Stock ticker symbol is required.',
        },
      });
      return;
    }

    const quote = await MarketService.getStockQuote(symbol.toUpperCase());

    if (!quote) {
      res.status(404).json({
        success: false,
        error: {
          code: 'STOCK_NOT_FOUND',
          message: `Stock with symbol ${symbol} was not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const range = (req.query.range as '1W' | '1M' | '1Y') || '1M';

    if (!symbol) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SYMBOL_REQUIRED',
          message: 'Stock ticker symbol is required.',
        },
      });
      return;
    }

    // Validate the requested history range parameter
    const allowedRanges = ['1W', '1M', '1Y'];
    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RANGE',
          message: 'Invalid history range. Supported ranges are: 1W, 1M, 1Y',
        },
      });
      return;
    }

    const history = await MarketService.getStockHistory(symbol.toUpperCase(), range);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SYMBOL_REQUIRED',
          message: 'Stock ticker symbol is required.',
        },
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch stock analysis.',
        },
      });
      return;
    }

    const uppercaseSymbol = symbol.toUpperCase();

    // 1. Check if cached analysis exists and is fresh (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedAnalysis = await AIAnalysis.findOne({
      queryType: 'STOCK',
      symbol: uppercaseSymbol,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (cachedAnalysis) {
      res.status(200).json({
        success: true,
        data: {
          symbol: uppercaseSymbol,
          analysis: cachedAnalysis.responseText,
          cached: true,
          analyzedAt: cachedAnalysis.createdAt,
        },
      });
      return;
    }

    // 2. Fetch live metrics from Yahoo Finance to feed to the AI
    const quote = await MarketService.getStockQuote(uppercaseSymbol);
    if (!quote) {
      res.status(404).json({
        success: false,
        error: {
          code: 'STOCK_NOT_FOUND',
          message: `Stock with symbol ${symbol} was not found.`,
        },
      });
      return;
    }

    // 3. Trigger OpenAI analysis service
    const analysisText = await AIService.analyzeStock(
      quote.symbol,
      quote.price,
      quote.change,
      quote.changePercent,
      quote.open,
      quote.high,
      quote.low
    );

    // 4. Cache the result in MongoDB (using correct schema properties)
    await AIAnalysis.findOneAndUpdate(
      { queryType: 'STOCK', symbol: uppercaseSymbol },
      {
        userId: req.user._id,
        promptText: `Analyze ${uppercaseSymbol} at price ₹${quote.price}`,
        responseText: analysisText,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        symbol: uppercaseSymbol,
        analysis: analysisText,
        cached: false,
        analyzedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
