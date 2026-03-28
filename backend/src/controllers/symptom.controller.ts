import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as SymptomModel from '../models/Symptom';
import * as aiService from '../services/aiService';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

// ── Schemas ──────────────────────────────────────────────
export const createSymptomSchema = z.object({
  patient_id: z.string().uuid(),
  description: z.string().min(1),
  severity: z.number().min(1).max(10),
  source: z.enum(['manual', 'whatsapp', 'voice']).default('manual'),
  run_ai_analysis: z.boolean().default(true),
});

// ── Controllers ──────────────────────────────────────────

export async function createSymptom(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, description, severity, source, run_ai_analysis } = req.body;

    let aiAnalysis = null;
    if (run_ai_analysis) {
      try {
        aiAnalysis = await aiService.analyzeSymptoms(description);
      } catch (err: any) {
        // Don't fail the symptom creation if AI fails
        aiAnalysis = { error: err.message, status: 'ai_unavailable' };
      }
    }

    const symptom = await SymptomModel.createSymptom({
      patient_id,
      date: new Date().toISOString(),
      description,
      severity,
      source,
      ai_analysis: aiAnalysis,
    });

    sendCreated(res, symptom);
  } catch (err) {
    next(err);
  }
}

export async function getSymptomsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const symptoms = await SymptomModel.getSymptomsByPatient(patientId, limit);
    sendSuccess(res, symptoms);
  } catch (err) {
    next(err);
  }
}

export async function getSymptomById(req: Request, res: Response, next: NextFunction) {
  try {
    const symptom = await SymptomModel.getSymptomById(req.params.id);
    sendSuccess(res, symptom);
  } catch (err) {
    next(err);
  }
}

export async function getRecentSymptoms(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days as string) || 7;
    const symptoms = await SymptomModel.getRecentSymptoms(patientId, days);
    sendSuccess(res, symptoms);
  } catch (err) {
    next(err);
  }
}

export async function deleteSymptom(req: Request, res: Response, next: NextFunction) {
  try {
    await SymptomModel.deleteSymptom(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
