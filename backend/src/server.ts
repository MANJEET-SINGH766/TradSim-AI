import app from './app';
import { connectDB } from './config/db';
import { TradingService } from './services/tradingService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Run the background order checker interval locally or if not on Vercel
  if (!process.env.VERCEL) {
    setInterval(() => {
      TradingService.checkAndProcessPendingOrders();
    }, 30000);
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

export default app;
