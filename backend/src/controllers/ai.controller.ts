import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as aiService from '../services/aiService';
import * as AIReportModel from '../models/AIReport';
import * as AlertModel from '../models/Alert';
import * as SymptomModel from '../models/Symptom';
import * as BiometricModel from '../models/Biometric';
import * as MedLogModel from '../models/MedicationLog';
import * as PatientModel from '../models/Patient';
import { notifyDoctor } from '../services/notificationService';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

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

// ── Controllers ──────────────────────────────────────────

/**
 * Analyze symptoms via AI
 */
export async function analyzeSymptoms(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, patient_id } = req.body;

    // Get patient history if patient_id provided
    let history: string | undefined;
    if (patient_id) {
      try {
        const patient = await PatientModel.getPatientById(patient_id);
        if (patient) {
          history = `Diagnosis: ${(patient as any).current_diagnosis || 'Unknown'}. History: ${(patient as any).medical_history || 'None'}`;
        }
      } catch { /* ignore */ }
    }

    const analysis = await aiService.analyzeSymptoms(text, history);
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
    const formatted = await aiService.formatWhatsAppData(raw_message);
    sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * Generate weekly AI report for a patient
 */
export async function generateWeeklyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id } = req.body;

    // Gather last 7 days of data
    const [symptoms, biometrics, medicationLogs] = await Promise.all([
      SymptomModel.getRecentSymptoms(patient_id, 7),
      BiometricModel.getRecentBiometrics(patient_id, 7),
      MedLogModel.getMedicationLogsByPatient(patient_id, 50),
    ]);

    const reportData = await aiService.generateWeeklyReport({
      symptoms,
      biometrics,
      medicationLogs,
    });

    // Save report to DB
    const weekOf = new Date().toISOString().split('T')[0];
    const report = await AIReportModel.createAIReport({
      patient_id,
      week_of: weekOf,
      summary: reportData.summary,
      risk_level: reportData.risk_level,
      recommendations: reportData.recommendations,
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
            reportData.summary
          );
        }
      } catch { /* ignore */ }
    }

    sendCreated(res, { report, analysis: reportData });
  } catch (err) {
    next(err);
  }
}

/**
 * Evaluate misdiagnosis risk
 */
export async function evaluateRisk(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id } = req.body;

    const patient = await PatientModel.getPatientById(patient_id);
    if (!patient) return sendError(res, 'Patient not found', 404);

    const symptoms = await SymptomModel.getRecentSymptoms(patient_id, 30);
    const biometrics = await BiometricModel.getRecentBiometrics(patient_id, 30);

    const risk = await aiService.evaluateRisk({
      currentDiagnosis: (patient as any).current_diagnosis || 'Unknown',
      symptoms,
      biometrics,
      timeline: '30 days',
    });

    // Create critical alert if needed
    if (risk.requires_immediate_review && (patient as any).assigned_doctor_id) {
      await notifyDoctor(
        patient_id,
        (patient as any).assigned_doctor_id,
        'critical',
        'Misdiagnosis risk detected — immediate review needed',
        JSON.stringify(risk.concerns)
      );
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
