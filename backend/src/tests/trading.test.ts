import mongoose from 'mongoose';
import { User } from '../models/User';
import { Holding } from '../models/Holding';
import { Transaction } from '../models/Transaction';
import { TradingService } from '../services/tradingService';
import { MarketService } from '../services/marketService';

// Mock the MarketService to avoid real Yahoo Finance network requests during tests
jest.mock('../services/marketService', () => {
  return {
    MarketService: {
      getStockQuote: jest.fn(),
    },
  };
});

describe('Trading Service Math & Ledger Tests', () => {
  let userId: string;

  // 1. Set up a test database connection before tests run
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/tradesim-test';
    await mongoose.connect(mongoUri);
  }, 20000); // 20-second connection timeout for Windows hosts

  // 2. Tear down the connection after all tests finish
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 3. Clear database collections before each individual test runs
  beforeEach(async () => {
    await User.deleteMany({});
    await Holding.deleteMany({});
    await Transaction.deleteMany({});
    jest.clearAllMocks();

    // Create a dummy user with ₹10,00,000 cash balance
    const user = await User.create({
      name: 'Test Student',
      email: 'test@student.com',
      passwordHash: 'hashed_password',
      virtualBalance: 1000000.00,
    });
    userId = user._id.toString();
  });

  test('BUY Order: should deduct balance and calculate average cost price correctly', async () => {
    const symbol = 'RELIANCE.NS';

    // Mock stock quote price at ₹3,000
    (MarketService.getStockQuote as jest.Mock).mockResolvedValue({
      symbol,
      price: 3000.00,
    });

    // Buy 10 shares of RELIANCE at ₹3,000 (total ₹30,000)
    const firstTrade = await TradingService.executeOrder(userId, symbol, 10, 'BUY');

    expect(firstTrade.type).toBe('BUY');
    expect(firstTrade.quantity).toBe(10);
    expect(firstTrade.price).toBe(3000.00);
    expect(firstTrade.totalValue).toBe(30000.00);
    expect(firstTrade.newBalance).toBe(970000.00); // 10,00,000 - 30,000

    // Check Holding doc was created correctly
    let holding = await Holding.findOne({ userId, symbol });
    expect(holding).toBeTruthy();
    expect(holding?.quantity).toBe(10);
    expect(holding?.averagePrice).toBe(3000.00);

    // Mock stock quote price at ₹3,200 for the next buy
    (MarketService.getStockQuote as jest.Mock).mockResolvedValue({
      symbol,
      price: 3200.00,
    });

    // Buy 10 more shares of RELIANCE at ₹3,200 (total ₹32,000)
    const secondTrade = await TradingService.executeOrder(userId, symbol, 10, 'BUY');
    expect(secondTrade.newBalance).toBe(938000.00); // 9,70,000 - 32,000

    // Average cost should now be: ((10 * 3000) + (10 * 3200)) / 20 = ₹3,100
    holding = await Holding.findOne({ userId, symbol });
    expect(holding?.quantity).toBe(20);
    expect(holding?.averagePrice).toBe(3100.00);
  });

  test('SELL Order: should credit balance and calculate realized P&L correctly', async () => {
    const symbol = 'TCS.NS';

    // 1. Manually create pre-existing holding of 10 shares at ₹3,000 average cost price
    await Holding.create({
      userId,
      symbol,
      quantity: 10,
      averagePrice: 3000.00,
    });

    // Mock stock quote price at ₹3,500 for the sale
    (MarketService.getStockQuote as jest.Mock).mockResolvedValue({
      symbol,
      price: 3500.00,
    });

    // Sell 5 shares of TCS at ₹3,500 (total credit ₹17,500)
    // Cost basis of these 5 shares = 5 * 3000 = ₹15,000
    // Realized Profit = 17,500 - 15,000 = +₹2,500
    const firstSale = await TradingService.executeOrder(userId, symbol, 5, 'SELL');

    expect(firstSale.type).toBe('SELL');
    expect(firstSale.quantity).toBe(5);
    expect(firstSale.price).toBe(3500.00);
    expect(firstSale.totalValue).toBe(17500.00);
    expect(firstSale.realizedPnL).toBe(2500.00);
    expect(firstSale.newBalance).toBe(1017500.00); // 10,00,000 + 17,500

    // Verify holding count decreased to 5
    let holding = await Holding.findOne({ userId, symbol });
    expect(holding?.quantity).toBe(5);
    expect(holding?.averagePrice).toBe(3000.00); // Cost basis average remains unchanged

    // Mock stock quote price at ₹2,800 for the next sale (making a loss)
    (MarketService.getStockQuote as jest.Mock).mockResolvedValue({
      symbol,
      price: 2800.00,
    });

    // Sell remaining 5 shares of TCS at ₹2,800 (total credit ₹14,000)
    // Cost basis = 5 * 3000 = ₹15,000
    // Realized Loss = 14,000 - 15,000 = -₹1,000
    const secondSale = await TradingService.executeOrder(userId, symbol, 5, 'SELL');
    expect(secondSale.realizedPnL).toBe(-1000.00);
    expect(secondSale.newBalance).toBe(1031500.00); // 10,17,500 + 14,000

    // Holding row should be deleted since quantity is now 0
    holding = await Holding.findOne({ userId, symbol });
    expect(holding).toBeNull();
  });
});
