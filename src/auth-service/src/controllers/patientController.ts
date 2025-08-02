import e, { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';

export const patientSignup = async (req: Request, res: Response) => {
  const { fullname, email, password, role } = req.body;

  logger.info({ email, fullname }, 'User signup attempt');

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn({ email }, 'Signup failed: Email already exists');
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullname, email, password: hashedPassword, role },
    });

    const token = generateToken({ userId: user.id, email: user.email });
    logger.info({ userId: user.id, email }, 'User created successfully');
    res.status(201).json({ message: 'User created', userId: user.id, token });
  } catch (err: any) {
    logger.error({ err: err.message, email }, 'Signup error');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const patientLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info({ email }, 'User login attempt');

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn({ email }, 'Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn({ email }, 'Login failed: Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    logger.info({ userId: user.id, email }, 'User login successful');
    res.status(200).json({ message: 'Login successful', token });
  } catch (err: any) {
    logger.error({ err: err.message, email }, 'Login error');
    res
      .status(500)
      .json({ message: 'Internal server error', err: err.message });
  }
};

