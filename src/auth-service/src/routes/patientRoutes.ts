import { Router } from 'express';
import { patientSignup, patientLogin } from '../controllers/patientController';
import { validateBody } from '../middleware/validationMiddleware';
import { signupSchema, loginSchema } from '../utils/validation';

const router = Router();


router.post('/signup', validateBody(signupSchema), patientSignup);
router.post('/login', validateBody(loginSchema), patientLogin);

export default router;
