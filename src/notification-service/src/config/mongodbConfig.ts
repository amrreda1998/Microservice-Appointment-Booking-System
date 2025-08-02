import mongoose from 'mongoose';
import logger from '../utils/logger';

// MongoDB Connection
export const connectMongoDB = async () => {
  try {
    const mongoUrl =
      process.env.MONGODB_URL || 'mongodb://localhost:27017/notifications';
    await mongoose.connect(mongoUrl);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB failed:', error);
    process.exit(1);
  }
};
