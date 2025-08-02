import logger from '../utils/logger';

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  speciality?: string;
  experience?: number;
  consultationFee?: number;
}

export async function validateUser(token: string): Promise<User | null> {
  try {
    console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);
    console.log('token', token);

    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
    });
    console.log('response', response);

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }

    logger.warn(
      { status: response.status },
      'Failed to validate user with auth service'
    );
    return null;
  } catch (error: any) {
    logger.error(
      { error: error.message },
      'Error communicating with auth service'
    );
    return null;
  }
}
export async function getDoctorById(
  doctorId: string,
  token: string
): Promise<User | null> {
  try {
    const response = await fetch(
      `${AUTH_SERVICE_URL}/api/doctors/${doctorId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.doctor;
    }

    logger.warn(
      { doctorId, status: response.status },
      'Failed to get doctor from auth service'
    );
    return null;
  } catch (error: any) {
    logger.error(
      { error: error.message, doctorId },
      'Error getting doctor from auth service'
    );
    return null;
  }
}
