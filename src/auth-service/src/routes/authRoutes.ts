import { authenticateToken } from '../middleware/authMiddleware';
import { getUserProfile } from '../controllers/authController';
import { Router } from 'express';

const router = Router();

router.get('/', authenticateToken, getUserProfile);

export default router;
