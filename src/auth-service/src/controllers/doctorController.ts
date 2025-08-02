import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { generateToken } from '../utils/jwt';

export const getAllDoctors = async (req: Request, res: Response) => {
  logger.info('Getting All Doctors data request');
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        fullname: true,
        speciality: true,
        experience: true,
        consultationFee: true,
      },
    });
    logger.info('Doctors data retrieved successfully');
    res.json(doctors);
  } catch (error) {
    logger.error('Get Doctors data request error');
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

export const doctorSignup = async (req: Request, res: Response) => {
  logger.info('Register a new Docotor request');
  const { fullname, email, password, speciality, experience, consultationFee } =
    req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        role: 'DOCTOR',
        speciality,
        experience: parseInt(experience),
        consultationFee: parseFloat(consultationFee),
      },
    });

    logger.info(doctor, 'Doctor registered successfully');
    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor.id,
        fullname: doctor.fullname,
        email: doctor.email,
        speciality: doctor.speciality,
      },
    });
  } catch (err: any) {
    logger.error(
      {
        err: err.message,
        doctor: {
          fullname,
          email,
          password,
          speciality,
          experience,
          consultationFee,
        },
      },
      'Failed to register doctor'
    );
    res
      .status(500)
      .json({ error: 'Failed to register doctor', details: err.message });
  }
};

export const doctorLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info({ email }, 'Doctor login attempt');

  try {
    const doctor = await prisma.user.findUnique({ where: { email } });
    if (!doctor) {
      logger.warn({ email }, 'Login failed: doctor not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      logger.warn({ email }, 'Login failed: Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: doctor.id, email: doctor.email });
    logger.info({ doctorId: doctor.id, email }, 'doctor login successful');
    res.status(200).json({ message: 'Login successful', token });
  } catch (err: any) {
    logger.error({ err: err.message, email }, 'Login error');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  const doctorId = req.params.id;
  logger.info({ doctorId }, 'Doctor info request');
  try {
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      logger.warn({ doctorId }, 'Profile request failed: Doctor not found');
      return res.status(404).json({ message: 'doctor not found' });
    }

    const { id, email, fullname, createdAt, role } = doctor;
    logger.info({ doctorId: id, email }, 'Doctor info retrieved successfully');
    res.status(200).json({
      message: 'Doctor info',
      doctor: { id, email, fullname, createdAt, role },
    });
  } catch (err: any) {
    logger.error({ err: err.message, doctorId }, 'Doctor info request error');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  const doctorId = req.params.id;
  const { fullname, email, speciality, experience, consultationFee, role } =
    req.body;

  // Explicitly prevent role updates
  if (role !== undefined) {
    logger.warn({ doctorId, role }, 'Update failed: Role cannot be modified');
    return res.status(400).json({ message: 'Role cannot be modified' });
  }

  logger.info(
    {
      doctorId,
      updateData: { fullname, email, speciality, experience, consultationFee },
    },
    'Update doctor request'
  );

  try {
    // Check if doctor exists
    const existingDoctor = await prisma.user.findUnique({
      where: { id: doctorId, role: 'DOCTOR' },
    });

    if (!existingDoctor) {
      logger.warn({ doctorId }, 'Update failed: Doctor not found');
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if email is being updated and if it's already taken by another user
    if (email && email !== existingDoctor.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        logger.warn({ doctorId, email }, 'Update failed: Email already exists');
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email;
    if (speciality) updateData.speciality = speciality;
    if (experience) updateData.experience = parseInt(experience);
    if (consultationFee)
      updateData.consultationFee = parseFloat(consultationFee);

    // Update doctor
    const updatedDoctor = await prisma.user.update({
      where: { id: doctorId },
      data: updateData,
      select: {
        id: true,
        fullname: true,
        email: true,
        speciality: true,
        experience: true,
        consultationFee: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info({ doctorId: updatedDoctor.id }, 'Doctor updated successfully');
    res.status(200).json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor,
    });
  } catch (err: any) {
    logger.error({ err: err.message, doctorId }, 'Update doctor error');
    res.status(500).json({
      message: 'Internal server error',
      details: err.message,
    });
  }
};
