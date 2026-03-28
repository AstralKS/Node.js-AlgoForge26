import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as BioModel from '../models/Biometric';
import { sendSuccess, sendCreated } from '../utils/response';

// ── Schemas ──────────────────────────────────────────────
export const createBiometricSchema = z.object({
  patient_id: z.string().uuid(),
  type: z.enum(['bp', 'glucose', 'heart_rate', 'temperature', 'weight', 'spo2']),
  value: z.string().min(1),
  unit: z.string().min(1),
  timestamp: z.string().optional(),
});

// ── Controllers ──────────────────────────────────────────

export async function createBiometric(req: Request, res: Response, next: NextFunction) {
  try {
    const bio = await BioModel.createBiometric({
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });
    sendCreated(res, bio);
  } catch (err) { next(err); }
}

export async function getBiometricsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.params;
    const type = req.query.type as BioModel.BiometricType | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const bios = await BioModel.getBiometricsByPatient(patientId, type, limit);
    sendSuccess(res, bios);
  } catch (err) { next(err); }
}

export async function getRecentBiometrics(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days as string) || 7;
    const bios = await BioModel.getRecentBiometrics(patientId, days);
    sendSuccess(res, bios);
  } catch (err) { next(err); }
}

export async function deleteBiometric(req: Request, res: Response, next: NextFunction) {
  try {
    await BioModel.deleteBiometric(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
