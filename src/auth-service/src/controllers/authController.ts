import { Request, Response } from 'express';
import { prisma } from '../prisma';
import logger from '../utils/logger';

export const getUserProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  logger.info({ userId }, 'Profile request');

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.warn({ userId }, 'Profile request failed: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const { id, email, fullname, createdAt, role } = user;
    logger.info({ userId: id, email }, 'Profile retrieved successfully');
    res.status(200).json({
      message: 'User profile',
      user: { id, email, fullname, createdAt, role },
    });
  } catch (err: any) {
    logger.error({ err: err.message, userId }, 'Profile request error');
    res.status(500).json({ message: 'Internal server error' });
  }
};
