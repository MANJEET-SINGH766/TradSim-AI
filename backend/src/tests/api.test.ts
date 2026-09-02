process.env.NODE_ENV = 'test';
const testMongoUri = process.env.MONGO_URI_TEST || process.env.MONGODB_URI || 'mongodb://localhost:27017/tradesim-test';
process.env.MONGODB_URI = testMongoUri;

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Watchlist } from '../models/Watchlist';
import { PendingOrder } from '../models/PendingOrder';

describe('Express API Route Integration Tests', () => {
  // 1. Connect to local test database before starting tests
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  }, 20000);

  // 2. Close connection after completing all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 3. Reset database collections before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Watchlist.deleteMany({});
    await PendingOrder.deleteMany({});
  });

  describe('Authentication Route Tests', () => {
    const testUser = {
      name: 'Simulated Trader',
      email: 'sim@trader.com',
      password: 'password123',
    };

    test('POST /api/v1/auth/register: should create user and return session cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(testUser.name);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.virtualBalance).toBe(1000000.00); // Check starting balance
      
      // Verify HttpOnly session cookie was issued
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('token=');
    });

    test('POST /api/v1/auth/register: should block registration with existing email', async () => {
      // Pre-register user in DB
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // Try registering again with same details
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already exists');
    });

    test('POST /api/v1/auth/login: should block login with invalid password', async () => {
      // Pre-register user in DB
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // Attempt login with incorrect password
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong_password',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid email or password');
    });
  });

  describe('Order Routing Security Tests', () => {
    test('POST /api/v1/orders: should block unauthorized order submissions', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({
          symbol: 'RELIANCE.NS',
          quantity: 10,
          type: 'BUY',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
