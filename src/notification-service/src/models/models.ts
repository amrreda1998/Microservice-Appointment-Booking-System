import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED'],
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model('Notification', notificationSchema);
