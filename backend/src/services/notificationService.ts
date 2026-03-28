import { createAlert, AlertInsert } from '../models/Alert';
import { logger } from '../utils/logger';

/**
 * Create an in-app notification via the alerts table
 */
export async function notifyPatient(
  patientId: string,
  type: 'critical' | 'weekly' | 'info',
  message: string,
  aiExplanation?: string
) {
  const alert: AlertInsert = {
    patient_id: patientId,
    doctor_id: null,
    type,
    message,
    ai_explanation: aiExplanation || null,
    read: false,
  };

  const created = await createAlert(alert);
  logger.info(`🔔 Notification → patient=${patientId}, type=${type}`);
  return created;
}

/**
 * Create a doctor alert (e.g., AI flags a high-risk patient)
 */
export async function notifyDoctor(
  patientId: string,
  doctorId: string,
  type: 'critical' | 'weekly' | 'info',
  message: string,
  aiExplanation?: string
) {
  const alert: AlertInsert = {
    patient_id: patientId,
    doctor_id: doctorId,
    type,
    message,
    ai_explanation: aiExplanation || null,
    read: false,
  };

  const created = await createAlert(alert);
  logger.info(`🔔 Doctor alert → doctor=${doctorId}, patient=${patientId}, type=${type}`);
  return created;
}
