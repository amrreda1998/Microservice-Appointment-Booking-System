import { Request, Response } from 'express';
import { prisma } from '../prisma';
import logger from '../utils/logger';
import { getDoctorById, validateUser } from '../services/authService';
import { sendAppointmentNotification } from '../services/notificationService';

export const createAppointment = async (req: Request, res: Response) => {
  const { doctorId, dateTime, notes } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  logger.info({ doctorId, dateTime }, 'Creating appointment');

  try {
    // Validate user with auth service
    const user = await validateUser(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    // Validate doctor exists with auth service
    const doctor = await getDoctorById(doctorId, token);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the requested time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        dateTime: new Date(dateTime),
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
    });

    if (existingAppointment) {
      logger.warn({ doctorId, dateTime }, 'Time slot not available');
      return res.status(409).json({
        message: 'This time slot is not available',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        dateTime: new Date(dateTime),
        notes,
        status: 'PENDING',
      },
    });

    // Send single notification for appointment creation
    await sendAppointmentNotification({
      appointmentId: appointment.id,
      patientId: user.id,
      doctorId: doctorId,
      message: `Appointment created between ${user.fullname} and Dr. ${
        doctor.fullname
      } on ${new Date(dateTime).toLocaleString()}`,
      type: 'APPOINTMENT_CREATED',
    });

    logger.info(
      { appointmentId: appointment.id },
      'Appointment created successfully'
    );
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        dateTime: appointment.dateTime,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to create appointment');
    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  logger.info('Getting appointments');

  try {
    // Validate user with auth service

    const user = await validateUser(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    let appointments;

    if (user.role === 'DOCTOR') {
      // Doctors see appointments where they are the doctor
      appointments = await prisma.appointment.findMany({
        where: { doctorId: user.id },
        orderBy: { dateTime: 'desc' },
      });
    } else {
      // Patients see appointments where they are the patient
      appointments = await prisma.appointment.findMany({
        where: { patientId: user.id },
        orderBy: { dateTime: 'desc' },
      });
    }

    logger.info(
      { userId: user.id, count: appointments.length },
      'Appointments retrieved successfully'
    );
    res.json({
      message: 'Appointments retrieved successfully',
      appointments: appointments.map((apt) => ({
        id: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        dateTime: apt.dateTime,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
      })),
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to get appointments');
    res.status(500).json({
      message: 'Failed to get appointments',
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  logger.info({ appointmentId: id, status }, 'Updating appointment status');

  try {
    // Validate user with auth service
    const user = await validateUser(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      logger.warn({ appointmentId: id }, 'Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to update this appointment
    if (user.role === 'DOCTOR' && appointment.doctorId !== user.id) {
      logger.warn(
        { userId: user.id, appointmentId: id },
        'Doctor not authorized to update this appointment'
      );
      return res
        .status(403)
        .json({ message: 'Not authorized to update this appointment' });
    }

    if (user.role === 'PATIENT' && appointment.patientId !== user.id) {
      logger.warn(
        { userId: user.id, appointmentId: id },
        'Patient not authorized to update this appointment'
      );
      return res
        .status(403)
        .json({ message: 'Not authorized to update this appointment' });
    }

    // Validate status
    const DoctorsValidStatuses = [
      'PENDING',
      'CONFIRMED',
      'CANCELLED',
      'COMPLETED',
      'NO_SHOW',
    ];

    const PatientsValidStatuses = ['PENDING', 'CANCELLED'];

    if (user.role === 'DOCTOR' && !DoctorsValidStatuses.includes(status)) {
      logger.warn({ status }, 'Invalid appointment status');
      return res.status(400).json({
        message:
          'Invalid status. Must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW',
      });
    }

    //make sure status order is preserved for doctor status update
    if (
      user.role === 'DOCTOR' &&
      DoctorsValidStatuses.findIndex(
        (status) => status === appointment.status
      ) > DoctorsValidStatuses.findIndex((docstatus) => docstatus === status)
    ) {
      logger.warn({ status }, 'Invalid appointment status');
      return res.status(400).json({
        message:
          'Invalid status. Must in this ORDER and one of : PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW',
      });
    }

    if (user.role === 'PATIENT' && !PatientsValidStatuses.includes(status)) {
      logger.warn({ status }, 'Invalid appointment status');
      return res.status(400).json({
        message: 'Invalid status. Must be one of: PENDING, CANCELLED',
      });
    }
    //make sure status order is preserved for patient status update

    if (
      user.role === 'PATIENT' &&
      PatientsValidStatuses.findIndex(
        (Patientstatus) => Patientstatus === appointment.status
      ) >
        PatientsValidStatuses.findIndex(
          (Patientstatus) => Patientstatus === status
        )
    ) {
      logger.warn({ status }, 'Invalid appointment status');
      return res.status(400).json({
        message:
          'Invalid status Must in this ORDER and one of: PENDING, CANCELLED',
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    // Send single notification for appointment status update
    await sendAppointmentNotification({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      message: `Appointment status updated to: ${status}`,
      type: 'APPOINTMENT_UPDATED',
    });

    logger.info(
      { appointmentId: id, status },
      'Appointment status updated successfully'
    );
    res.json({
      message: 'Appointment status updated successfully',
      appointment: {
        id: updatedAppointment.id,
        patientId: updatedAppointment.patientId,
        doctorId: updatedAppointment.doctorId,
        dateTime: updatedAppointment.dateTime,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
        createdAt: updatedAppointment.createdAt,
        updatedAt: updatedAppointment.updatedAt,
      },
    });
  } catch (error: any) {
    logger.error(
      { error: error.message },
      'Failed to update appointment status'
    );
    res.status(500).json({
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
};
