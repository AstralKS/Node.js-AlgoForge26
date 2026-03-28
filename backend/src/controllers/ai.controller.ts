import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as aiDirect from '../services/aiService';
import * as aiProxy from '../services/aiServiceProxy';
import * as AIReportModel from '../models/AIReport';
import * as AlertModel from '../models/Alert';
import * as SymptomModel from '../models/Symptom';
import * as BiometricModel from '../models/Biometric';
import * as MedLogModel from '../models/MedicationLog';
import * as PatientModel from '../models/Patient';
import { notifyDoctor } from '../services/notificationService';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { logger } from '../utils/logger';

// ── Schemas ──────────────────────────────────────────────
export const analyzeSchema = z.object({
  text: z.string().min(1),
  patient_id: z.string().uuid().optional(),
});

export const formatWhatsAppSchema = z.object({
  raw_message: z.string().min(1),
  from: z.string().optional(),
});

export const weeklyReportSchema = z.object({
  patient_id: z.string().uuid(),
});

export const riskEvalSchema = z.object({
  patient_id: z.string().uuid(),
});

// ── Helpers ──────────────────────────────────────────────

/**
 * Determines whether the Python AI service is reachable.
 * Caches result for 30 seconds to avoid hammering the health check.
 */
let _aiServiceUp: boolean | null = null;
let _aiServiceCheckedAt = 0;
const AI_CACHE_TTL = 30_000; // 30 seconds

async function isAIServiceAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_aiServiceUp !== null && now - _aiServiceCheckedAt < AI_CACHE_TTL) {
    return _aiServiceUp;
  }
  try {
    _aiServiceUp = await aiProxy.checkAIServiceHealth();
  } catch {
    _aiServiceUp = false;
  }
  _aiServiceCheckedAt = now;
  logger.info(`🧠 AI Service availability: ${_aiServiceUp ? '✅ UP' : '❌ DOWN (will use direct OpenRouter)'}`);
  return _aiServiceUp;
}

// ── Controllers ──────────────────────────────────────────

/**
 * Analyze symptoms via AI.
 * Primary: Python AI Service → Fallback: direct OpenRouter.
 */
export async function analyzeSymptoms(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, patient_id } = req.body;
    let analysis: any;

    const aiUp = await isAIServiceAvailable();

    if (aiUp && patient_id) {
      // ── Primary path: Python AI Service (richer pipeline) ──
      logger.info('🧠 Using Python AI Service for symptom analysis');
      try {
        analysis = await aiProxy.aiAnalyzeSymptoms(patient_id, text);
        // The AI service returns { status, analysis }
        analysis = analysis?.analysis || analysis;
      } catch (err: any) {
        logger.warn(`⚠️ AI Service call failed, falling back to direct: ${err.message}`);
        analysis = null;
      }
    }

    if (!analysis) {
      // ── Fallback: direct OpenRouter call ──
      logger.info('🌐 Using direct OpenRouter for symptom analysis');
      let history: string | undefined;
      if (patient_id) {
        try {
          const patient = await PatientModel.getPatientById(patient_id);
          if (patient) {
            history = `Diagnosis: ${(patient as any).current_diagnosis || 'Unknown'}. History: ${(patient as any).medical_history || 'None'}`;
          }
        } catch { /* ignore */ }
      }
      analysis = await aiDirect.analyzeSymptoms(text, history);
    }

    sendSuccess(res, analysis);
  } catch (err) {
    next(err);
  }
}

/**
 * Format WhatsApp message into structured data via AI
 */
export async function formatWhatsApp(req: Request, res: Response, next: NextFunction) {
  try {
    const { raw_message } = req.body;
    const formatted = await aiDirect.formatWhatsAppData(raw_message);
    sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * Generate weekly AI report for a patient.
 * Primary: Python AI Service (full pipeline with insights + doctor summary) → Fallback: direct OpenRouter.
 */
export async function generateWeeklyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id } = req.body;
    const aiUp = await isAIServiceAvailable();
    let reportData: any;
    let usedProxy = false;

    if (aiUp) {
      // ── Primary: Python AI Service (includes insight_generator + doctor_summary) ──
      logger.info('🧠 Using Python AI Service for weekly report');
      try {
        const proxyResult = await aiProxy.aiGenerateWeeklyReport(patient_id);
        // proxyResult = { status, report, insights, doctor_summary }
        reportData = {
          summary: proxyResult?.report?.summary || proxyResult?.doctor_summary || '',
          risk_level: proxyResult?.report?.risk_level || proxyResult?.insights?.risk_level || 'low',
          recommendations: proxyResult?.report?.recommendations || {},
          key_findings: proxyResult?.report?.key_findings || [],
          trends: proxyResult?.report?.biometric_trends || {},
          medication_adherence: proxyResult?.report?.medication_adherence || null,
          insights: proxyResult?.insights,
          doctor_summary: proxyResult?.doctor_summary,
          full_report: proxyResult?.report,
        };
        usedProxy = true;
      } catch (err: any) {
        logger.warn(`⚠️ AI Service weekly report failed, falling back: ${err.message}`);
      }
    }

    if (!reportData) {
      // ── Fallback: direct OpenRouter ──
      logger.info('🌐 Using direct OpenRouter for weekly report');
      const [symptoms, biometrics, medicationLogs] = await Promise.all([
        SymptomModel.getRecentSymptoms(patient_id, 7),
        BiometricModel.getRecentBiometrics(patient_id, 7),
        MedLogModel.getMedicationLogsByPatient(patient_id, 50),
      ]);

      reportData = await aiDirect.generateWeeklyReport({
        symptoms,
        biometrics,
        medicationLogs,
      });
    }

    // Save report to DB
    const weekOf = new Date().toISOString().split('T')[0];
    const report = await AIReportModel.createAIReport({
      patient_id,
      week_of: weekOf,
      summary: typeof reportData.summary === 'string' ? reportData.summary : JSON.stringify(reportData.summary),
      risk_level: reportData.risk_level || 'low',
      recommendations: typeof reportData.recommendations === 'object'
        ? JSON.stringify(reportData.recommendations)
        : reportData.recommendations,
      signed_by_doctor: false,
      signed_at: null,
    });

    // If high risk, create alert for doctor
    if (['high', 'critical'].includes(reportData.risk_level)) {
      try {
        const patient = await PatientModel.getPatientById(patient_id);
        if ((patient as any)?.assigned_doctor_id) {
          await notifyDoctor(
            patient_id,
            (patient as any).assigned_doctor_id,
            reportData.risk_level === 'critical' ? 'critical' : 'weekly',
            `Weekly report for patient shows ${reportData.risk_level} risk`,
            typeof reportData.summary === 'string' ? reportData.summary : JSON.stringify(reportData.summary)
          );
        }
      } catch { /* ignore */ }
    }

    sendCreated(res, {
      report,
      analysis: reportData,
      source: usedProxy ? 'ai-service' : 'direct-openrouter',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Evaluate misdiagnosis risk.
 * Primary: Python AI Service → Fallback: direct OpenRouter.
 */
export async function evaluateRisk(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id } = req.body;
    const aiUp = await isAIServiceAvailable();
    let risk: any;

    if (aiUp) {
      logger.info('🧠 Using Python AI Service for risk evaluation');
      try {
        const proxyResult = await aiProxy.aiEvaluateRisk(patient_id);
        risk = proxyResult?.risk_evaluation || proxyResult;
      } catch (err: any) {
        logger.warn(`⚠️ AI Service risk eval failed, falling back: ${err.message}`);
      }
    }

    if (!risk) {
      logger.info('🌐 Using direct OpenRouter for risk evaluation');
      const patient = await PatientModel.getPatientById(patient_id);
      if (!patient) return sendError(res, 'Patient not found', 404);

      const symptoms = await SymptomModel.getRecentSymptoms(patient_id, 30);
      const biometrics = await BiometricModel.getRecentBiometrics(patient_id, 30);

      risk = await aiDirect.evaluateRisk({
        currentDiagnosis: (patient as any).current_diagnosis || 'Unknown',
        symptoms,
        biometrics,
        timeline: '30 days',
      });
    }

    // Create critical alert if needed
    const needsReview = risk.requires_immediate_review || risk.alert_doctor;
    if (needsReview) {
      try {
        const patient = await PatientModel.getPatientById(patient_id);
        if ((patient as any)?.assigned_doctor_id) {
          await notifyDoctor(
            patient_id,
            (patient as any).assigned_doctor_id,
            'critical',
            'Misdiagnosis risk detected — immediate review needed',
            JSON.stringify(risk.concerns || risk)
          );
        }
      } catch { /* ignore */ }
    }

    sendSuccess(res, risk);
  } catch (err) {
    next(err);
  }
}

/**
 * Get AI reports for a patient
 */
export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const reports = await AIReportModel.getAIReportsByPatient(req.params.patientId);
    sendSuccess(res, reports);
  } catch (err) { next(err); }
}

/**
 * Sign an AI report (doctor action)
 */
export async function signReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await AIReportModel.signReport(req.params.id);
    sendSuccess(res, report);
  } catch (err) { next(err); }
}

/**
 * Get unsigned reports (for doctor dashboard)
 */
export async function getUnsignedReports(req: Request, res: Response, next: NextFunction) {
  try {
    const doctorId = req.query.doctorId as string | undefined;
    const reports = await AIReportModel.getUnsignedReports(doctorId);
    sendSuccess(res, reports);
  } catch (err) { next(err); }
}

/**
 * Get alerts
 */
export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.query as any;
    if (role === 'doctor') {
      const alerts = await AlertModel.getAlertsByDoctor(userId);
      return sendSuccess(res, alerts);
    }
    const alerts = await AlertModel.getAlertsByPatient(userId);
    sendSuccess(res, alerts);
  } catch (err) { next(err); }
}

/**
 * Mark alert as read
 */
export async function markAlertRead(req: Request, res: Response, next: NextFunction) {
  try {
    const alert = await AlertModel.markAlertRead(req.params.id);
    sendSuccess(res, alert);
  } catch (err) { next(err); }
}
