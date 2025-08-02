import { redisClient } from '../config/redisConfig';
import { processNotification } from './notificationProcessor';
import logger from './logger';

// Simple async message consumer
export const startListening = async () => {
  try {
    // Subscribe to notifications channel
    await redisClient.subscribe('notifications', async (message) => {
      try {
        const data = JSON.parse(message);
        await processNotification(data);
      } catch (error) {
        logger.error('Error parsing message:', error);
      }
    });

    logger.info('Listening for notifications...');
  } catch (error) {
    logger.error('Error starting consumer:', error);
  }
};
