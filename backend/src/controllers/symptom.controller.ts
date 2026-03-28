import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as SymptomModel from '../models/Symptom';
import * as aiDirect from '../services/aiService';
import * as aiProxy from '../services/aiServiceProxy';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { logger } from '../utils/logger';

// ── Schemas ──────────────────────────────────────────────
export const createSymptomSchema = z.object({
  patient_id: z.string().uuid(),
  description: z.string().min(1),
  severity: z.number().min(1).max(10),
  source: z.enum(['manual', 'whatsapp', 'voice']).default('manual'),
  run_ai_analysis: z.boolean().default(true),
});

// ── AI check ─────────────────────────────────────────────
let _aiUp: boolean | null = null;
let _aiCheckedAt = 0;

async function isAIServiceAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_aiUp !== null && now - _aiCheckedAt < 30_000) return _aiUp;
  try { _aiUp = await aiProxy.checkAIServiceHealth(); } catch { _aiUp = false; }
  _aiCheckedAt = now;
  return _aiUp;
}

// ── Controllers ──────────────────────────────────────────

export async function createSymptom(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, description, severity, source, run_ai_analysis } = req.body;

    let aiAnalysis = null;
    if (run_ai_analysis) {
      const aiUp = await isAIServiceAvailable();

      if (aiUp) {
        // Primary: Python AI Service
        try {
          logger.info('🧠 Using Python AI Service for symptom analysis');
          const result = await aiProxy.aiAnalyzeSymptoms(patient_id, description);
          aiAnalysis = result?.analysis || result;
        } catch (err: any) {
          logger.warn(`⚠️ AI Service failed, falling back: ${err.message}`);
        }
      }

      if (!aiAnalysis) {
        // Fallback: direct OpenRouter
        try {
          logger.info('🌐 Using direct OpenRouter for symptom analysis');
          aiAnalysis = await aiDirect.analyzeSymptoms(description);
        } catch (err: any) {
          aiAnalysis = { error: err.message, status: 'ai_unavailable' };
        }
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
