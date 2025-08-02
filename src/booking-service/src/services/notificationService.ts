import { createClient } from 'redis';
import logger from '../utils/logger';

// Simple Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let isConnected = false;

// Connect to Redis
export const connectNotificationService = async () => {
  try {
    await redisClient.connect();
    isConnected = true;
    logger.info('Redis connected for notifications');
  } catch (error) {
    logger.warn('Redis connection failed - notifications disabled');
  }
};

// Function to send a single notification for an appointment
export const sendAppointmentNotification = async (
  notification: NotificationData
) => {
  try {
    if (!isConnected) {
      logger.warn('Redis not connected - notification skipped');
      return;
    }

    const message = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString(),
    });

    await redisClient.publish('notifications', message);
    logger.info(
      `Notification queued: ${notification.type} for appointment ${notification.appointmentId}`
    );
  } catch (error) {
    logger.warn('Failed to queue notification:', error);
  }
};

interface NotificationData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  message: string;
  type: 'APPOINTMENT_CREATED' | 'APPOINTMENT_UPDATED';
}
