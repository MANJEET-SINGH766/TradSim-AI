import { Request, Response, NextFunction } from 'express';
import { TradingService } from '../services/tradingService';
import { PendingOrder } from '../models/PendingOrder';
import { z } from 'zod';

// Order Input Validation Schema
const placeOrderSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required').toUpperCase(),
  quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be greater than 0'),
  type: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Order type must be either BUY or SELL' }),
  }),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS']).default('MARKET'),
  triggerPrice: z.number().positive('Trigger price must be greater than 0').optional(),
}).refine(data => {
  if (data.orderType !== 'MARKET' && !data.triggerPrice) {
    return false;
  }
  return true;
}, {
  message: 'Trigger price is required for Limit and Stop-Loss orders',
  path: ['triggerPrice']
});

/**
 * Controller to handle trade orders (MARKET, LIMIT, STOP_LOSS)
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

    // 3. Handle immediate MARKET orders
    if (validatedData.orderType === 'MARKET') {
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
      return;
    }

    // 4. Handle pending LIMIT & STOP_LOSS orders
    const pendingOrder = await PendingOrder.create({
      userId: req.user._id,
      symbol: validatedData.symbol,
      type: validatedData.type,
      orderType: validatedData.orderType,
      quantity: validatedData.quantity,
      triggerPrice: validatedData.triggerPrice,
    });

    res.status(201).json({
      success: true,
      message: `${validatedData.orderType} order placed successfully.`,
      data: pendingOrder,
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
    
    // Pass business logic errors to response
    res.status(400).json({
      success: false,
      error: {
        code: 'ORDER_FAILED',
        message: (error as Error).message,
      },
    });
  }
};

/**
 * Retrieve all active pending orders for the logged-in user
 */
export const getPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized access.' }
      });
      return;
    }

    const pendingOrders = await PendingOrder.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: pendingOrders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Cancel a specific pending order
 */
export const cancelPendingOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized access.' }
      });
      return;
    }

    const { id } = req.params;
    const deletedOrder = await PendingOrder.findOneAndDelete({
      _id: id,
      userId: req.user._id
    }).exec();

    if (!deletedOrder) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Pending order not found or unauthorized to cancel.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Pending order successfully cancelled.',
      data: deletedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};
