import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import chatRoutes from './routes/chat.js';
import subscriptionRoutes from './routes/subscription.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await initDatabase();
  
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/settings', settingsRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();