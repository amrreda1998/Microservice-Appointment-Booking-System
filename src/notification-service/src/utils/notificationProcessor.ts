import { Notification } from '../models/models';
import logger from './logger';

// Simple function to process notifications
export const processNotification = async (data: any) => {
  try {
    logger.info('Processing notification:', data);

    // 1. Save to database
    const notification = new Notification({
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      message: data.message,
      type: data.type,
    });

    await notification.save();
    logger.info(`Notification saved: ${notification._id}`);

    // 2. Simulate sending notification (replace with real email/SMS service)
    await sendNotification(notification);
  } catch (error) {
    logger.error('Error processing notification:', error);
  }
};

// Simple function to "send" notification
const sendNotification = async (notification: any) => {
  try {
    // Simulate async sending (like email API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update status to sent
    notification.status = 'SENT';
    await notification.save();

    logger.info(`Notification sent: ${notification.message}`);
  } catch (error) {
    // Mark as failed
    notification.status = 'FAILED';
    await notification.save();
    logger.error('Failed to send notification:', error);
  }
};
