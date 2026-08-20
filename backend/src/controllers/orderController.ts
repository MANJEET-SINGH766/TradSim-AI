import { Request, Response, NextFunction } from 'express';
import { TradingService } from '../services/tradingService';
import { z } from 'zod';

// Order Input Validation Schema
const placeOrderSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required').toUpperCase(),
  quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be greater than 0'),
  type: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Order type must be either BUY or SELL' }),
  }),
});

/**
 * Controller to handle trade orders
 */
export const placeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Verify user is logged in
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to execute trade orders.',
        },
      });
      return;
    }

    // 2. Validate incoming request body payload
    const validatedData = placeOrderSchema.parse(req.body);

    // 3. Call trading engine service to execute order
    const result = await TradingService.executeOrder(
      req.user._id.toString(),
      validatedData.symbol,
      validatedData.quantity,
      validatedData.type
    );

    res.status(200).json({
      success: true,
      data: result,
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
    
    // Pass business logic errors (e.g. Insufficient Balance) to centralized handler
    res.status(400).json({
      success: false,
      error: {
        code: 'ORDER_FAILED',
        message: (error as Error).message,
      },
    });
  }
};
