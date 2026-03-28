import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as MedModel from '../models/Medication';
import * as MedLogModel from '../models/MedicationLog';
import { sendSuccess, sendCreated } from '../utils/response';

// ── Schemas ──────────────────────────────────────────────
export const createMedicationSchema = z.object({
  patient_id: z.string().uuid(),
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  prescribed_by: z.string().nullable().optional(),
});

export const logMedicationSchema = z.object({
  medication_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  taken: z.boolean(),
  scheduled_time: z.string(),
  actual_time: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ── Controllers ──────────────────────────────────────────

export async function createMedication(req: Request, res: Response, next: NextFunction) {
  try {
    const med = await MedModel.createMedication({
      ...req.body,
      end_date: req.body.end_date || null,
      prescribed_by: req.body.prescribed_by || null,
    });
    sendCreated(res, med);
  } catch (err) { next(err); }
}

export async function getMedicationsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const meds = await MedModel.getMedicationsByPatient(req.params.patientId);
    sendSuccess(res, meds);
  } catch (err) { next(err); }
}

export async function getActiveMedications(req: Request, res: Response, next: NextFunction) {
  try {
    const meds = await MedModel.getActiveMedications(req.params.patientId);
    sendSuccess(res, meds);
  } catch (err) { next(err); }
}

export async function logMedication(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await MedLogModel.createMedicationLog({
      ...req.body,
      actual_time: req.body.actual_time || null,
      notes: req.body.notes || null,
    });
    sendCreated(res, log);
  } catch (err) { next(err); }
}

export async function getMedicationLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await MedLogModel.getMedicationLogsByPatient(req.params.patientId);
    sendSuccess(res, logs);
  } catch (err) { next(err); }
}

export async function getAdherenceRate(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const rate = await MedLogModel.getAdherenceRate(req.params.patientId, days);
    sendSuccess(res, { adherence_rate: rate, period_days: days });
  } catch (err) { next(err); }
}

export async function deleteMedication(req: Request, res: Response, next: NextFunction) {
  try {
    await MedModel.deleteMedication(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
