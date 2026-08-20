import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';

/**
 * Controller to retrieve user transaction ledgers
 */
export const getTransactions = async (
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
          message: 'You must be logged in to access transaction history.',
        },
      });
      return;
    }

    // Fetch transaction logs sorted by execution date (newest first)
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ executedAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
