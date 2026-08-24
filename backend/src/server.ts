import app from './app';
import { connectDB } from './config/db';
import { TradingService } from './services/tradingService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database first
  await connectDB();

  // Start background cron checking for pending orders
  setInterval(() => {
    TradingService.checkAndProcessPendingOrders();
  }, 30000); // 30 seconds

  // Start listening for requests
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
