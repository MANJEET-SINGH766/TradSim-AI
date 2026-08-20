import { User } from '../models/User';
import { Holding } from '../models/Holding';
import { MarketService } from './marketService';

export interface HoldingSummary {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioSummary {
  cash: number;
  totalHoldingsValue: number;
  totalCostBasis: number;
  netWorth: number;
  totalPnL: number;
  totalReturnPercent: number;
  holdings: HoldingSummary[];
}

export class PortfolioService {
  /**
   * Aggregate active holdings and calculate total portfolio value and gains
   */
  static async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    // 1. Fetch user to get cash balance
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cash = user.virtualBalance;

    // 2. Fetch all active stock holdings owned by user
    const holdings = await Holding.find({ userId });

    let totalHoldingsValue = 0;
    let totalCostBasis = 0;
    const holdingSummaries: HoldingSummary[] = [];

    // 3. Loop through active holdings and get real-time valuations
    for (const holding of holdings) {
      const quote = await MarketService.getStockQuote(holding.symbol);
      
      // Fallback to average purchase cost if Yahoo Finance quote is down
      const currentPrice = quote ? quote.price : holding.averagePrice;
      
      const totalCost = holding.averagePrice * holding.quantity;
      const currentValue = currentPrice * holding.quantity;
      const unrealizedPnL = currentValue - totalCost;
      const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

      totalHoldingsValue += currentValue;
      totalCostBasis += totalCost;

      holdingSummaries.push({
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.averagePrice,
        currentPrice,
        totalCost,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      });
    }

    // 4. Calculate final portfolio net valuation sums
    const netWorth = cash + totalHoldingsValue;
    const initialCapital = 1000000.00; // Starting virtual balance
    const totalPnL = netWorth - initialCapital;
    const totalReturnPercent = (totalPnL / initialCapital) * 100;

    return {
      cash,
      totalHoldingsValue,
      totalCostBasis,
      netWorth,
      totalPnL,
      totalReturnPercent,
      holdings: holdingSummaries,
    };
  }
}
