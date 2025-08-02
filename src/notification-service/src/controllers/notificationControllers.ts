import { Request, Response } from 'express';
import { Notification } from '../models/models';
import logger from '../utils/logger';

// Get user notifications (for both patient and doctor)
export const getUserNotifications = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = (req as any).user.id;
  const { type, read } = req.query;
  
  logger.info('Fetching notifications', {
    userId,
    type,
    read,
    path: req.path,
    method: req.method
  });

  try {
    const query: any = {
      $or: [{ patientId: userId }, { doctorId: userId }],
    };
    
    // Add optional filters
    if (type) {
      query.type = type;
      logger.debug('Applying type filter', { type });
    }
    if (read !== undefined) {
      query.read = read === 'true';
      logger.debug('Applying read filter', { read: query.read });
    }

    logger.debug('Executing database query', { query });
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const responseTime = Date.now() - startTime;
    
    logger.info('Successfully fetched notifications', {
      userId,
      notificationCount: notifications.length,
      responseTime: `${responseTime}ms`
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      responseTime: `${responseTime}ms`
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Error fetching notifications', {
      error: errorMessage,
      stack: process.env.NODE_ENV === 'production' ? undefined : errorStack,
      userId,
      path: req.path,
      method: req.method
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage
    });
  }
};

// Get simple stats
export const getStats = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = (req as any).user?.id;
  
  logger.info('Fetching notification statistics', {
    userId,
    path: req.path,
    method: req.method
  });

  try {
    logger.debug('Counting total notifications');
    const total = await Notification.countDocuments();
    
    logger.debug('Counting sent notifications');
    const sent = await Notification.countDocuments({ status: 'SENT' });
    
    logger.debug('Counting read notifications');
    const read = await Notification.countDocuments({ read: true });
    
    const unread = total - read;
    const responseTime = Date.now() - startTime;
    
    logger.info('Successfully fetched notification statistics', {
      total,
      sent,
      read,
      unread,
      responseTime: `${responseTime}ms`
    });
    
    res.json({
      success: true,
      data: {
        total,
        sent,
        read,
        unread,
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Error fetching notification statistics', {
      error: errorMessage,
      stack: process.env.NODE_ENV === 'production' ? undefined : errorStack,
      userId,
      path: req.path
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notification statistics',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage
    });
  }
};
