import { Request, Response, NextFunction } from 'express';
import * as whatsappService from '../services/whatsappService';
import * as aiDirect from '../services/aiService';
import * as aiProxy from '../services/aiServiceProxy';
import * as SymptomModel from '../models/Symptom';
import * as BiometricModel from '../models/Biometric';
import * as MedLogModel from '../models/MedicationLog';
import { notifyDoctor } from '../services/notificationService';
import * as PatientModel from '../models/Patient';
import * as MessageModel from '../models/Message';
import { sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';

// Sentinel user ID representing the WhatsApp AI bot
const WHATSAPP_BOT_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── AI Service availability check (shared with ai.controller) ──
let _aiUp: boolean | null = null;
let _aiCheckedAt = 0;

async function isAIServiceAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_aiUp !== null && now - _aiCheckedAt < 30_000) return _aiUp;
  try { _aiUp = await aiProxy.checkAIServiceHealth(); } catch { _aiUp = false; }
  _aiCheckedAt = now;
  return _aiUp;
}

/**
 * Twilio webhook handler — receives incoming WhatsApp messages.
 * Routes through the Python AI service for the full pipeline
 * (intent → extract → analyze → misdiagnosis check → respond).
 */
export async function handleIncoming(req: Request, res: Response, next: NextFunction) {
  // 1. Immediately acknowledge Twilio to avoid webhook timeouts (15s limit)
  res.type('text/xml');
  res.send('<Response></Response>');

  // 2. Process heavy AI tasks asynchronously
  (async () => {
    try {
      const parsed = whatsappService.parseIncomingMessage(req.body);
      logger.info(`📱 WhatsApp from ${parsed.from}: ${parsed.message.substring(0, 80)}...`);

      const aiUp = await isAIServiceAvailable();
      let result: any;

      // Look up patient by WhatsApp number
      let patientId: string | null = null;
      let patientUserId: string | null = null;
      try {
        const patients = await PatientModel.getPatientByWhatsApp(parsed.from);
        if (patients) {
          patientId = (patients as any).id;
          patientUserId = (patients as any).user_id || null;
        }
      } catch { /* no patient mapping yet */ }

      // Persist the incoming patient message to Supabase
      if (patientUserId) {
        try {
          await MessageModel.createMessage({
            sender_id: patientUserId,
            receiver_id: WHATSAPP_BOT_USER_ID,
            content: parsed.message,
            read: true,
          });
        } catch (e: any) { logger.warn(`⚠️ Failed to save incoming WhatsApp message: ${e.message}`); }
      }

      if (aiUp && patientId) {
        // ── Full AI pipeline via Python service ──
        logger.info('🧠 Routing to Python AI Service for full WhatsApp pipeline');
        try {
          const aiResult = await aiProxy.aiProcessWhatsApp(patientId, parsed.message, parsed.from);
          result = {
            raw: parsed,
            ai_processed: aiResult,
            actions_taken: [],
            source: 'ai-service',
          };

          // Auto-store data based on AI service results
          if (aiResult.extracted_data) {
            // Symptoms
            const symptoms = aiResult.extracted_data.symptoms_found || aiResult.extracted_data.symptoms || [];
            for (const s of symptoms) {
              try {
                await SymptomModel.createSymptom({
                  patient_id: patientId,
                  date: new Date().toISOString(),
                  description: s.description || s.name || String(s),
                  severity: s.severity || 5,
                  source: 'whatsapp',
                  ai_analysis: aiResult.analysis || null,
                });
                result.actions_taken.push(`Stored symptom: ${s.name || s.description}`);
              } catch (e: any) { logger.warn(`Failed to store symptom: ${e.message}`); }
            }

            // Biometrics
            const biometrics = aiResult.extracted_data.biometrics;
            if (biometrics && typeof biometrics === 'object') {
              const unitMap: Record<string, string> = {
                temperature: '°F', blood_pressure: 'mmHg', bp: 'mmHg',
                heart_rate: 'bpm', glucose: 'mg/dL', weight: 'kg', spo2: '%',
              };
              const entries = Array.isArray(biometrics)
                ? biometrics
                : Object.entries(biometrics).filter(([, v]) => v != null).map(([k, v]) => ({ type: k, value: String(v), unit: unitMap[k] || '' }));

              for (const b of entries) {
                try {
                  await BiometricModel.createBiometric({
                    patient_id: patientId,
                    type: (b as any).type,
                    value: String((b as any).value),
                    unit: (b as any).unit || '',
                    timestamp: new Date().toISOString(),
                  });
                  result.actions_taken.push(`Stored biometric: ${(b as any).type} = ${(b as any).value}`);
                } catch (e: any) { logger.warn(`Failed to store biometric: ${e.message}`); }
              }
            }
          }

          // If urgent, notify doctor
          if (aiResult.needs_doctor_attention || aiResult.urgency === 'critical') {
            try {
              const patient = await PatientModel.getPatientById(patientId);
              if ((patient as any)?.assigned_doctor_id) {
                await notifyDoctor(
                  patientId,
                  (patient as any).assigned_doctor_id,
                  'critical',
                  `Urgent WhatsApp message from patient: ${parsed.message.substring(0, 100)}`,
                  JSON.stringify(aiResult.analysis || aiResult.risk_check || {})
                );
                result.actions_taken.push('doctor_notified');
              }
            } catch { /* ignore */ }
          }
        } catch (err: any) {
          logger.warn(`⚠️ AI Service WhatsApp processing failed: ${err.message}`);
          // Fall through to direct OpenRouter
        }
      }

      if (!result) {
        // ── Fallback: direct OpenRouter call ──
        logger.info('🌐 Using direct OpenRouter for WhatsApp processing');
        const formatted = await aiDirect.formatWhatsAppData(parsed.message);
        result = {
          raw: parsed,
          ai_formatted: formatted,
          actions_taken: [],
          source: 'direct-openrouter',
        };

        if (formatted.urgency === 'critical' || formatted.needs_doctor_attention) {
          result.actions_taken.push('doctor_notified');
          logger.warn(`🚨 Urgent message from ${parsed.from} — flagged for doctor`);
        }
      }

      // Determine the AI's suggested reply — fallback to a generated acknowledgement if missing
      let suggestedReply: string | null =
        result?.ai_processed?.suggested_reply ||
        result?.ai_formatted?.suggested_reply ||
        null;

      // Build a fallback reply from extracted data when AI didn't provide one
      if (!suggestedReply) {
        const fmt = result?.ai_formatted;
        if (fmt) {
          const biometrics: any[] = fmt.extracted_data?.biometrics || [];
          const symptoms: any[] = fmt.extracted_data?.symptoms || [];
          const urgency: string = fmt.urgency || 'low';

          const parts: string[] = ['✅ Got your message!'];

          if (biometrics.length > 0) {
            const readings = biometrics.map((b: any) => `${b.type}: ${b.value} ${b.unit || ''}`.trim()).join(', ');
            parts.push(`I've recorded your readings (${readings}).`);
          }
          if (symptoms.length > 0) {
            const names = symptoms.map((s: any) => s.name || s.description).join(', ');
            parts.push(`Your symptom report (${names}) has been logged.`);
          }
          if (urgency === 'critical' || fmt.needs_doctor_attention) {
            parts.push('⚠️ This has been flagged as urgent and forwarded to your doctor. If this is an emergency, please call 108 or go to the nearest hospital immediately.');
          } else {
            parts.push('Keep tracking your health — your care team can see your updates. 💙');
          }

          suggestedReply = parts.join(' ');
        }
      }

      // Persist the AI reply to Supabase and send it back via Twilio REST API
      if (suggestedReply) {
        if (patientUserId) {
          try {
            await MessageModel.createMessage({
              sender_id: WHATSAPP_BOT_USER_ID,
              receiver_id: patientUserId,
              content: suggestedReply,
              read: false,
            });
          } catch (e: any) { logger.warn(`⚠️ Failed to save AI WhatsApp reply: ${e.message}`); }
        }

        // Delay slightly for natural feel, then send via REST API instead of TwiML
        setTimeout(async () => {
          try {
            await whatsappService.sendWhatsAppMessage(parsed.from, suggestedReply!);
            logger.info(`✅ WhatsApp reply sent to ${parsed.from}: ${suggestedReply!.substring(0, 80)}...`);
          } catch (e: any) {
            logger.error(`❌ Failed to push WhatsApp reply onto Twilio: ${e.message}`);
          }
        }, 500);
      } else {
        logger.warn(`⚠️ No reply generated for message from ${parsed.from} — patient not responded`);
      }

      logger.info('WhatsApp processed:', JSON.stringify(result, null, 2));
    } catch (err) {
      logger.error('WhatsApp async background processing error:', err);
    }
  })();
}

/**
 * Test endpoint — simulate WhatsApp message processing.
 * Uses the full AI pipeline via Python service when available.
 */
export async function simulateMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, patient_id } = req.body;
    const aiUp = await isAIServiceAvailable();
    let responseData: any;

    if (aiUp && patient_id) {
      // ── Primary: Python AI Service (full pipeline) ──
      logger.info('🧠 Simulating via Python AI Service (full pipeline)');
      try {
        const aiResult = await aiProxy.aiProcessWhatsApp(patient_id, message);

        const actions: string[] = [];

        // Auto-store extracted data
        if (aiResult.extracted_data) {
          const symptoms = aiResult.extracted_data.symptoms_found || aiResult.extracted_data.symptoms || [];
          for (const s of symptoms) {
            try {
              await SymptomModel.createSymptom({
                patient_id,
                date: new Date().toISOString(),
                description: s.description || s.name || String(s),
                severity: s.severity || 5,
                source: 'whatsapp',
                ai_analysis: aiResult.analysis || null,
              });
              actions.push(`Created symptom: ${s.name || s.description || s}`);
            } catch { /* ignore */ }
          }

          const biometrics = aiResult.extracted_data.biometrics;
          if (biometrics && typeof biometrics === 'object') {
            const unitMap: Record<string, string> = {
              temperature: '°F', blood_pressure: 'mmHg', bp: 'mmHg',
              heart_rate: 'bpm', glucose: 'mg/dL', weight: 'kg', spo2: '%',
            };
            const entries = Array.isArray(biometrics)
              ? biometrics
              : Object.entries(biometrics).filter(([, v]) => v != null).map(([k, v]) => ({ type: k, value: String(v), unit: unitMap[k] || '' }));

            for (const b of entries) {
              try {
                await BiometricModel.createBiometric({
                  patient_id,
                  type: (b as any).type,
                  value: String((b as any).value),
                  unit: (b as any).unit || '',
                  timestamp: new Date().toISOString(),
                });
                actions.push(`Created biometric: ${(b as any).type} = ${(b as any).value}`);
              } catch { /* ignore */ }
            }
          }
        }

        responseData = {
          original_message: message,
          source: 'ai-service',
          intent: aiResult.intent,
          intent_details: aiResult.intent_details,
          extracted_data: aiResult.extracted_data,
          symptom_analysis: aiResult.analysis,
          misdiagnosis_check: aiResult.risk_check,
          suggested_reply: aiResult.suggested_reply,
          urgency: aiResult.urgency,
          needs_doctor_attention: aiResult.needs_doctor_attention,
          actions_taken: actions,
        };
      } catch (err: any) {
        logger.warn(`⚠️ AI Service simulate failed, falling back: ${err.message}`);
      }
    }

    if (!responseData) {
      // ── Fallback: direct OpenRouter ──
      logger.info('🌐 Simulating via direct OpenRouter');
      const formatted = await aiDirect.formatWhatsAppData(message);
      const actions: string[] = [];

      if (patient_id && formatted.extracted_data) {
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

      responseData = {
        original_message: message,
        source: 'direct-openrouter',
        ai_formatted: formatted,
        actions_taken: actions,
      };
    }

    sendSuccess(res, responseData);
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
