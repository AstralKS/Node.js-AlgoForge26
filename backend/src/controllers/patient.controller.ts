import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as UserModel from '../models/User';
import * as PatientModel from '../models/Patient';
import * as DoctorModel from '../models/Doctor';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

// ── Schemas ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email(),
  role: z.enum(['patient', 'doctor']),
});

export const registerPatientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  medical_history: z.string().optional(),
  current_diagnosis: z.string().optional(),
  whatsapp_number: z.string().optional(),
});

export const registerDoctorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  specialization: z.string().min(1),
  license_number: z.string().min(1),
  hospital: z.string().optional(),
});

// ── Controllers ──────────────────────────────────────────

/**
 * Simple login — find user by email+role, return their profile
 * No JWT, no password. For testing only.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role } = req.body;
    const user = await UserModel.getUserByEmail(email);

    if (!user || user.role !== role) {
      return sendError(res, 'User not found with that email and role', 404, 'USER_NOT_FOUND');
    }

    // Get the profile (patient or doctor)
    let profile = null;
    if (role === 'patient') {
      profile = await PatientModel.getPatientByUserId(user.id);
    } else {
      profile = await DoctorModel.getDoctorByUserId(user.id);
    }

    sendSuccess(res, { user, profile });
  } catch (err) {
    next(err);
  }
}

/**
 * Register a new patient
 */
export async function registerPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, ...patientData } = req.body;

    // Check if email already exists
    const existing = await UserModel.getUserByEmail(email);
    if (existing) {
      return sendError(res, 'Email already registered', 409, 'DUPLICATE_EMAIL');
    }

    // Create user
    const user = await UserModel.createUser({ name, email, phone, role: 'patient' });

    // Create patient profile
    const patient = await PatientModel.createPatient({
      user_id: user.id,
      date_of_birth: patientData.date_of_birth || null,
      gender: patientData.gender || null,
      blood_group: patientData.blood_group || null,
      medical_history: patientData.medical_history || null,
      current_diagnosis: patientData.current_diagnosis || null,
      whatsapp_number: patientData.whatsapp_number || null,
      assigned_doctor_id: null,
    });

    sendCreated(res, { user, patient });
  } catch (err) {
    next(err);
  }
}

/**
 * Register a new doctor
 */
export async function registerDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, specialization, license_number, hospital } = req.body;

    const existing = await UserModel.getUserByEmail(email);
    if (existing) {
      return sendError(res, 'Email already registered', 409, 'DUPLICATE_EMAIL');
    }

    const user = await UserModel.createUser({ name, email, phone, role: 'doctor' });

    const doctor = await DoctorModel.createDoctor({
      user_id: user.id,
      specialization,
      license_number,
      hospital: hospital || null,
    });

    sendCreated(res, { user, doctor });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all users (for testing)
 */
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as 'patient' | 'doctor' | undefined;
    if (role) {
      const users = await UserModel.getUsersByRole(role);
      return sendSuccess(res, users);
    }
    // Get all
    const patients = await UserModel.getUsersByRole('patient');
    const doctors = await UserModel.getUsersByRole('doctor');
    sendSuccess(res, { patients, doctors });
  } catch (err) {
    next(err);
  }
}
