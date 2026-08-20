import { User } from '../models/User';
import { Holding } from '../models/Holding';
import { Transaction } from '../models/Transaction';
import { MarketService } from './marketService';

export interface OrderResult {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalValue: number;
  realizedPnL: number;
  newBalance: number;
}

export class TradingService {
  /**
   * Execute a virtual market trade order (BUY or SELL)
   */
  static async executeOrder(
    userId: string,
    symbol: string,
    quantity: number,
    type: 'BUY' | 'SELL'
  ): Promise<OrderResult> {
    // 1. Fetch current price from market data API
    const quote = await MarketService.getStockQuote(symbol);
    if (!quote) {
      throw new Error('Stock ticker quote unavailable. Cannot place order.');
    }
    const price = quote.price;
    const totalValue = price * quantity;

    if (type === 'BUY') {
      return await this.executeBuyOrder(userId, symbol, quantity, price, totalValue);
    } else {
      return await this.executeSellOrder(userId, symbol, quantity, price, totalValue);
    }
  }

  /**
   * Run BUY order updates with a manual rollback safety net
   */
  private static async executeBuyOrder(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    totalCost: number
  ): Promise<OrderResult> {
    // 1. Atomically deduct cash if user has sufficient funds
    const user = await User.findOneAndUpdate(
      { _id: userId, virtualBalance: { $gte: totalCost } },
      { $inc: { virtualBalance: -totalCost } },
      { new: true }
    );

    if (!user) {
      throw new Error('Insufficient virtual balance to complete this purchase.');
    }

    try {
      // 2. Try to update or insert the holding document
      const holding = await Holding.findOne({ userId, symbol });

      if (holding) {
        // Recompute average cost price for existing holding
        const oldQty = holding.quantity;
        const oldAvg = holding.averagePrice;
        const newQty = oldQty + quantity;
        const newAvgPrice = ((oldQty * oldAvg) + (quantity * price)) / newQty;

        holding.quantity = newQty;
        holding.averagePrice = newAvgPrice;
        await holding.save();
      } else {
        // Create new holding entry
        await Holding.create({
          userId,
          symbol,
          quantity,
          averagePrice: price,
        });
      }

      // 3. Create audit transaction document
      await Transaction.create({
        userId,
        symbol,
        type: 'BUY',
        quantity,
        price,
        totalValue: totalCost,
        realizedPnL: 0,
      });

      return {
        symbol,
        type: 'BUY',
        quantity,
        price,
        totalValue: totalCost,
        realizedPnL: 0,
        newBalance: user.virtualBalance,
      };
    } catch (error) {
      // ROLLBACK: Refund user cash if holding updates failed
      await User.findByIdAndUpdate(userId, { $inc: { virtualBalance: totalCost } });
      throw new Error(`Order execution failed: ${(error as Error).message}. Funds refunded.`);
    }
  }

  /**
   * Run SELL order updates with a manual rollback safety net
   */
  private static async executeSellOrder(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    totalCredit: number
  ): Promise<OrderResult> {
    // 1. Verify user holds enough shares to sell
    const holding = await Holding.findOne({ userId, symbol });
    if (!holding || holding.quantity < quantity) {
      throw new Error('Insufficient stock holdings to execute this sale.');
    }

    const averageCostPrice = holding.averagePrice;
    const oldQty = holding.quantity;
    
    // Calculate realized P&L: (Sale Price - Purchase Average Price) * Shares Sold
    const realizedPnL = (price - averageCostPrice) * quantity;

    // 2. Atomically reduce holding quantity
    const updatedHolding = await Holding.findOneAndUpdate(
      { userId, symbol, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    if (!updatedHolding) {
      throw new Error('Holding quantities modified concurrently. Please retry.');
    }

    // Clean up: delete holding row if owned quantity is now zero
    if (updatedHolding.quantity === 0) {
      await Holding.deleteOne({ _id: updatedHolding._id });
    }

    try {
      // 3. Add credit cash back to user wallet
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { virtualBalance: totalCredit } },
        { new: true }
      );

      if (!user) {
        throw new Error('User account not found during transaction processing.');
      }

      // 4. Create audit transaction document
      await Transaction.create({
        userId,
        symbol,
        type: 'SELL',
        quantity,
        price,
        totalValue: totalCredit,
        realizedPnL,
      });

      return {
        symbol,
        type: 'SELL',
        quantity,
        price,
        totalValue: totalCredit,
        realizedPnL,
        newBalance: user.virtualBalance,
      };
    } catch (error) {
      // ROLLBACK: Restore holding shares if cash increment failed
      if (oldQty === quantity) {
        // Re-create holding document if it was deleted
        await Holding.create({
          userId,
          symbol,
          quantity,
          averagePrice: averageCostPrice,
        });
      } else {
        await Holding.findOneAndUpdate(
          { userId, symbol },
          { $inc: { quantity: quantity } }
        );
      }
      throw new Error(`Order execution failed: ${(error as Error).message}. Stock holdings restored.`);
    }
  }
}
