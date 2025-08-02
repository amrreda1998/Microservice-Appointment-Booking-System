import express from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController';
import { validateBody } from '../middleware/validationMiddleware';
import {
  createAppointmentSchema,
  updateStatusSchema,
} from '../utils/validation';

const router = express.Router();

router.get('/', getAppointments);
router.post('/', validateBody(createAppointmentSchema), createAppointment);
router.patch('/:id', validateBody(updateStatusSchema), updateAppointmentStatus);

export default router;
