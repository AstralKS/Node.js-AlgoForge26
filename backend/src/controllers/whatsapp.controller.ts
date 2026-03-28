import { Request, Response, NextFunction } from 'express';
import * as whatsappService from '../services/whatsappService';
import * as aiService from '../services/aiService';
import * as SymptomModel from '../models/Symptom';
import * as BiometricModel from '../models/Biometric';
import * as MedLogModel from '../models/MedicationLog';
import { notifyDoctor } from '../services/notificationService';
import { sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Twilio webhook handler — receives incoming WhatsApp messages
 */
export async function handleIncoming(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = whatsappService.parseIncomingMessage(req.body);
    logger.info(`📱 WhatsApp from ${parsed.from}: ${parsed.message.substring(0, 80)}...`);

    // Step 1: Use AI to format the message
    const formatted = await aiService.formatWhatsAppData(parsed.message);
    logger.info(`🤖 AI classified as: ${formatted.type}, urgency: ${formatted.urgency}`);

    // Step 2: Store extracted data in Supabase
    // (In production, look up patient by whatsapp_number)
    // For now, return the formatted data
    const result: any = {
      raw: parsed,
      ai_formatted: formatted,
      actions_taken: [],
    };

    // Step 3: If urgent, notify doctor
    if (formatted.urgency === 'critical' || formatted.needs_doctor_attention) {
      result.actions_taken.push('doctor_notified');
      logger.warn(`🚨 Urgent message from ${parsed.from} — flagged for doctor`);
    }

    // Respond to Twilio with TwiML (empty response = no reply message)
    res.type('text/xml');
    res.send('<Response></Response>');

    // Log the result
    logger.info('WhatsApp processed:', JSON.stringify(result, null, 2));
  } catch (err) {
    logger.error('WhatsApp webhook error:', err);
    // Still respond to Twilio to avoid retries
    res.type('text/xml');
    res.send('<Response></Response>');
  }
}

/**
 * Test endpoint — simulate WhatsApp message processing
 */
export async function simulateMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, patient_id } = req.body;

    // Use AI to parse the message
    const formatted = await aiService.formatWhatsAppData(message);

    const actions: string[] = [];

    // Auto-create records based on AI classification
    if (patient_id && formatted.extracted_data) {
      // Store symptoms
      if (formatted.extracted_data.symptoms?.length) {
        for (const s of formatted.extracted_data.symptoms) {
          await SymptomModel.createSymptom({
            patient_id,
            date: new Date().toISOString(),
            description: s.description || s.name,
            severity: s.severity || 5,
            source: 'whatsapp',
            ai_analysis: formatted,
          });
          actions.push(`Created symptom: ${s.name}`);
        }
      }

      // Store biometrics
      if (formatted.extracted_data.biometrics?.length) {
        for (const b of formatted.extracted_data.biometrics) {
          await BiometricModel.createBiometric({
            patient_id,
            type: b.type,
            value: b.value,
            unit: b.unit,
            timestamp: new Date().toISOString(),
          });
          actions.push(`Created biometric: ${b.type} = ${b.value} ${b.unit}`);
        }
      }
    }

    sendSuccess(res, {
      original_message: message,
      ai_formatted: formatted,
      actions_taken: actions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Send a WhatsApp message (for testing)
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { to, message, template, vars } = req.body;

    if (template) {
      const result = await whatsappService.sendTemplateMessage(to, template, vars || {});
      return sendSuccess(res, result);
    }

    const result = await whatsappService.sendWhatsAppMessage(to, message);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
