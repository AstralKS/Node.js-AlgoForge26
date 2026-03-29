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

/**
 * Get all patients with their user details
 */
export async function getAllPatientsData(req: Request, res: Response, next: NextFunction) {
  try {
    const { getAllPatients } = await import('../models/Patient');
    const patients = await getAllPatients();
    
    // Format them to match the frontend expectations
    const formatted = patients.map((p: any) => ({
      id: p.id,
      name: p.users?.name || 'Unknown',
      email: p.users?.email || '',
      phone: p.users?.phone || '',
      condition: p.current_diagnosis || 'No diagnosis',
      risk: 'moderate', // default
      lastVisit: p.created_at,
    }));
    
    sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';

export const quickAddPatientSchema = z.object({
  name: z.string().min(1),
  symptoms: z.string().optional(),
  medicines: z.string().optional(),
  nextVisit: z.string().optional(),
  notes: z.string().optional(),
  transcription_id: z.string().optional(),
});

/**
 * Quick Add manually creating a patient (e.g. from Doctor Dashboard)
 * Auto-generates an email and links symptoms, medicines, visits, and transcriptions.
 */
export async function quickAddPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, symptoms, medicines, nextVisit, notes, transcription_id } = req.body;
    
    // Auto-generate a dummy email for the user
    const dummyEmail = `patient_${uuidv4().substring(0, 8)}@demo.com`;

    // 1. Create User
    const user = await UserModel.createUser({
      name,
      email: dummyEmail,
      phone: '0000000000',
      role: 'patient',
    });

    // 2. Create Patient Profile
    const patient = await PatientModel.createPatient({
      user_id: user.id,
      date_of_birth: null,
      gender: null,
      blood_group: null,
      medical_history: null,
      current_diagnosis: symptoms && symptoms.trim() !== '' ? symptoms.trim() : null,
      whatsapp_number: null,
      assigned_doctor_id: null,
    });

    // 3. Create Visit / Notes if provided
    if ((notes && notes.trim() !== '') || (nextVisit && nextVisit !== '')) {
      const { createVisit } = await import('../models/Visit');
      await createVisit({
        patient_id: patient.id,
        doctor_id: null,
        date: new Date().toISOString(),
        notes: notes && notes.trim() !== '' ? notes : null,
        follow_up_date: nextVisit && nextVisit !== '' ? new Date(nextVisit).toISOString() : null,
        transcript: null,
        prescriptions: null,
      });
    }

    // 4. Create symptom logs if symptoms provided
    if (symptoms && symptoms.trim() !== '') {
      const { createSymptom } = await import('../models/Symptom');
      await createSymptom({
        patient_id: patient.id,
        date: new Date().toISOString(),
        description: symptoms,
        severity: 5,
        source: 'manual',
        ai_analysis: null
      });
    }

    // 5. Create medication logs if provided
    if (medicines && medicines.trim() !== '') {
      const { createMedication } = await import('../models/Medication');
      await createMedication({
        patient_id: patient.id,
        name: medicines,
        dosage: 'As prescribed',
        frequency: 'Daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        prescribed_by: null
      });
    }

    // 6. Update transcription if voice was used
    if (transcription_id) {
      const { error } = await supabaseAdmin
        .from('transcriptions')
        .update({ patient_id: patient.id })
        .eq('id', transcription_id);
      
      if (error) console.error('[Supabase] Failed to link transcription to patient:', error);
    }

    sendCreated(res, { user, patient, message: 'Patient created successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get full patient profile including symptoms, medications, visits, and transcriptions.
 */
export async function getFullPatientProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.id;

    let patient;
    try {
      patient = await PatientModel.getPatientById(patientId);
    } catch (e: any) {
      if (e.code === 'PGRST116') {
        patient = await PatientModel.getPatientByUserId(patientId);
      } else {
        throw e;
      }
    }

    if (!patient) {
      return sendError(res, 'Patient not found', 404);
    }

    const truePatientId = patient.id;
    const user = await UserModel.getUserById(patient.user_id);

    const { getSymptomsByPatient } = await import('../models/Symptom');
    const symptoms = await getSymptomsByPatient(truePatientId);

    const { getMedicationsByPatient } = await import('../models/Medication');
    const medications = await getMedicationsByPatient(truePatientId);

    const { getVisitsByPatient } = await import('../models/Visit');
    const visits = await getVisitsByPatient(truePatientId);

    const { data: transcriptions, error: transErr } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('patient_id', truePatientId)
      .order('created_at', { ascending: false });

    if (transErr) throw transErr;

    const fullProfile = {
      ...patient,
      user,
      symptoms: symptoms || [],
      medications: medications || [],
      visits: visits || [],
      transcriptions: transcriptions || [],
    };

    sendSuccess(res, fullProfile);
  } catch (err) {
    next(err);
  }
}

