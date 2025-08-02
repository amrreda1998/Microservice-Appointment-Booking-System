import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function validateBody(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.error({ err: error.message }, 'Validation error');
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
} 