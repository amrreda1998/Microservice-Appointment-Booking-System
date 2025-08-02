import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  dateTime: Joi.date().greater('now').required(),
  notes: Joi.string().optional()
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW').required()
}); 