import { Request, Response, NextFunction } from 'express';
import { Watchlist } from '../models/Watchlist';
import { z } from 'zod';

const watchlistSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required').toUpperCase(),
});

/**
 * Get the user's active watchlist
 */
export const getWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access watchlist.',
        },
      });
      return;
    }

    // Try to find the user's watchlist document
    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    
    // Create an empty watchlist if it doesn't exist yet
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.user._id,
        symbols: [],
      });
    }

    res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a stock symbol to the user's watchlist
 */
export const addToWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to modify watchlist.',
        },
      });
      return;
    }

    const { symbol } = watchlistSchema.parse(req.body);

    // Use $addToSet to add the symbol to the array ONLY if it doesn't already exist
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { symbols: symbol } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        },
      });
      return;
    }
    next(error);
  }
};

/**
 * Remove a stock symbol from the user's watchlist
 */
export const removeFromWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to modify watchlist.',
        },
      });
      return;
    }

    const symbol = req.params.symbol.toUpperCase();

    // Use $pull to remove the symbol matching our string from the array
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { symbols: symbol } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};
