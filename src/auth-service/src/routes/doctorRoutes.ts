import express from 'express';
import {
  doctorLogin,
  doctorSignup,
  getDoctorById,
  getAllDoctors,
  updateDoctor,
} from '../controllers/doctorController';
import { authenticateToken } from '../middleware/authMiddleware';
import { loginSchema, signupSchema } from '../utils/validation';
import { validateBody } from '../middleware/validationMiddleware';

const router = express.Router();

router.get('/', getAllDoctors);
router.post('/signup', validateBody(signupSchema), doctorSignup);
router.post('/login', validateBody(loginSchema), doctorLogin);
router.get('/:id', authenticateToken, getDoctorById);
router.patch('/:id', authenticateToken, updateDoctor);

export default router;
