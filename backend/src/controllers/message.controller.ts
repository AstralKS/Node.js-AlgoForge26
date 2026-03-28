import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as MessageModel from '../models/Message';
import * as PatientModel from '../models/Patient';
import * as SymptomModel from '../models/Symptom';
import * as BiometricModel from '../models/Biometric';
import * as MedModel from '../models/Medication';
import * as MedLogModel from '../models/MedicationLog';
import * as aiDirect from '../services/aiService';
import * as aiProxy from '../services/aiServiceProxy';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { logger } from '../utils/logger';

// ── Schemas ──────────────────────────────────────────────
export const sendMessageSchema = z.object({
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string().min(1),
});

export const aiChatSchema = z.object({
  text: z.string().min(1),
  patient_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
});

// ── AI System Prompt Builder ─────────────────────────────
function buildCoordinatorPrompt(context: {
  patient: any;
  symptoms: any[];
  biometrics: any[];
  medications: any[];
  medicationLogs: any[];
}): string {
  const p = context.patient;
  const user = p?.users || p;
  const name = user?.name || 'the patient';
  const diagnosis = p.current_diagnosis || 'Not specified';
  const medHistory = p.medical_history || 'None on record';
  const gender = p.gender || 'Not specified';
  const dob = p.date_of_birth || 'Not specified';
  const bloodGroup = p.blood_group || 'Not specified';

  // Recent symptoms summary
  const recentSymptoms = context.symptoms.slice(0, 8).map((s: any) =>
    `- ${s.description} (severity ${s.severity}/10, ${new Date(s.date || s.created_at).toLocaleDateString()}, source: ${s.source})`
  ).join('\n') || '- None logged recently';

  // Latest biometrics
  const latestBio: Record<string, any> = {};
  context.biometrics.forEach((b: any) => {
    if (!latestBio[b.type] || new Date(b.timestamp) > new Date(latestBio[b.type].timestamp)) {
      latestBio[b.type] = b;
    }
  });
  const bioLines = Object.values(latestBio).map((b: any) =>
    `- ${b.type}: ${b.value} ${b.unit} (${new Date(b.timestamp).toLocaleDateString()})`
  ).join('\n') || '- No recent readings';

  // Medications
  const medLines = context.medications.map((m: any) =>
    `- ${m.name} ${m.dosage}, ${m.frequency}`
  ).join('\n') || '- None prescribed';

  // Medication adherence
  const totalMeds = context.medications.length;
  const takenToday = context.medicationLogs.filter((l: any) => {
    const today = new Date().toISOString().split('T')[0];
    return l.taken && (l.scheduled_time?.startsWith(today) || l.created_at?.startsWith(today));
  }).length;

  return `You are MEDI.AI, an intelligent healthcare coordination assistant for the MediAI platform.

## YOUR ROLE
You are a CARE COORDINATOR — not a diagnostician. Your job is to:
1. Help patients understand and communicate their health status to their doctor
2. Assess SEVERITY and URGENCY of symptoms (not diagnose diseases)
3. Encourage proper medication adherence and follow-through
4. Identify when symptoms need immediate medical attention
5. Facilitate better doctor-patient communication

## CRITICAL RULES
- NEVER say "You have [disease/condition]" — you do NOT diagnose
- DO assess: "Your symptoms suggest moderate/high/low severity — your doctor should review this"
- DO flag urgency levels: low / moderate / high / emergency
- Always recommend consulting the assigned doctor for anything clinical
- You CAN explain what symptoms generally indicate WITHOUT diagnosing
- Be warm, supportive, and clear — patients may be anxious

## PATIENT PROFILE
- Name: ${name}
- Gender: ${gender}
- Date of Birth: ${dob}
- Blood Group: ${bloodGroup}
- Current Diagnosis (from doctor): ${diagnosis}
- Medical History: ${medHistory}

## CURRENT HEALTH DATA (use this to give contextual responses)
### Recent Symptoms (last 7 days):
${recentSymptoms}

### Latest Biometric Readings:
${bioLines}

### Current Medications:
${medLines}

### Medication Adherence Today: ${takenToday}/${totalMeds} doses taken

## RESPONSE FORMAT
Respond in a clear, warm, conversational tone. Use:
- Short paragraphs, not walls of text
- Severity/urgency indicators when relevant (🟢 Low | 🟡 Moderate | 🔴 High | 🚨 Emergency)  
- Actionable next steps
- Never use markdown headers in your responses — keep it conversational
- End with a specific recommended action when symptoms are reported`;
}

// ── Controllers ──────────────────────────────────────────

/**
 * AI Chat: Full patient context, AI coordinator, logs both sides to messages table
 */
export async function aiChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, patient_id, user_id } = req.body;

    // Load full patient context in parallel
    const [patient, symptoms, biometrics, medications, medicationLogs] = await Promise.all([
      PatientModel.getPatientById(patient_id).catch(() => null),
      SymptomModel.getRecentSymptoms(patient_id, 14).catch(() => []),
      BiometricModel.getRecentBiometrics(patient_id, 14).catch(() => []),
      MedModel.getActiveMedications(patient_id).catch(() => []),
      MedLogModel.getMedicationLogsByPatient(patient_id, 30).catch(() => []),
    ]);

    if (!patient) {
      return sendError(res, 'Patient not found', 404);
    }

    // Build context-aware coordinator prompt
    const systemPrompt = buildCoordinatorPrompt({
      patient,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      biometrics: Array.isArray(biometrics) ? biometrics : [],
      medications: Array.isArray(medications) ? medications : [],
      medicationLogs: Array.isArray(medicationLogs) ? medicationLogs : [],
    });

    // Call AI (try proxy, fallback to direct)
    let aiReply = '';
    let aiServiceUp = false;
    try {
      const health = await aiProxy.checkAIServiceHealth();
      aiServiceUp = health;
    } catch { /* ignore */ }

    logger.info(`🤖 AI Chat for patient ${patient_id}, aiServiceUp=${aiServiceUp}`);

    // Use direct OpenRouter with the coordinator prompt (proxy doesn't support free-form chat)
    const result = await (aiDirect as any).callOpenRouterChat ?
      (aiDirect as any).callOpenRouterChat(systemPrompt, text) :
      callOpenRouterChatDirect(systemPrompt, text);

    aiReply = typeof result === 'string' ? result : result?.response || result?.content || JSON.stringify(result);

    // Log both messages to DB (patient → AI bot user)
    const patientUserId = (patient as any)?.user_id || user_id;
    const AI_BOT_USER_ID = '00000000-0000-0000-0000-000000000001'; // sentinel ID for AI

    if (patientUserId) {
      try {
        // Log patient message
        await MessageModel.createMessage({
          sender_id: patientUserId,
          receiver_id: AI_BOT_USER_ID,
          content: text,
          read: true,
        });
        // Log AI response
        await MessageModel.createMessage({
          sender_id: AI_BOT_USER_ID,
          receiver_id: patientUserId,
          content: aiReply,
          read: false,
        });
      } catch (logErr: any) {
        logger.warn(`⚠️ Failed to log messages to DB: ${logErr.message}`);
      }
    }

    // Also: if message contains health update keywords, try to parse and log a symptom
    const conditionKeywords = /\b(pain|hurts?|aching?|fever|headache|dizzy|nausea|vomit|bleed|fatigue|tired|swollen?|rash|cough|shortness of breath|chest)\b/i;
    let parsedCondition = null;
    if (conditionKeywords.test(text)) {
      try {
        const parsed = await aiDirect.analyzeSymptoms(text, undefined);
        parsedCondition = parsed;
        // Auto-log symptoms if detected
        if (parsed?.symptoms?.length > 0) {
          const SymptomModelDyn = await import('../models/Symptom');
          for (const sym of parsed.symptoms.slice(0, 3)) {
            await SymptomModelDyn.createSymptom({
              patient_id,
              date: new Date().toISOString(),
              description: sym.description || sym.name,
              severity: Math.min(10, Math.max(1, parseInt(sym.severity) || 5)),
              source: 'manual',
              ai_analysis: sym,
            }).catch(() => {});
          }
        }
      } catch { /* ignore */ }
    }

    return sendSuccess(res, {
      reply: aiReply,
      patient_context: {
        name: (patient as any)?.users?.name || 'Patient',
        diagnosis: (patient as any)?.current_diagnosis,
      },
      condition_parsed: parsedCondition,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Direct OpenRouter call for free-form chat (returns plain text, not JSON)
 */
async function callOpenRouterChatDirect(systemPrompt: string, userMessage: string): Promise<string> {
  const { env } = await import('../config/env');
  const apiKey = env.OPENROUTER_API_KEY_1 || env.OPENROUTER_API_KEY_2;
  const model = env.OPENROUTER_MODEL_1 || 'google/gemini-2.0-flash-001';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mediai.app',
      'X-Title': 'MediAI',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content || 'I apologize, I was unable to process your message. Please try again.';
}

/**
 * Send a direct message (patient ↔ doctor)
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { sender_id, receiver_id, content } = req.body;
    const msg = await MessageModel.createMessage({ sender_id, receiver_id, content, read: false });
    sendCreated(res, msg);
  } catch (err) {
    next(err);
  }
}

/**
 * Get conversation history between two users
 */
export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId1, userId2 } = req.query as { userId1: string; userId2: string };
    const limit = parseInt(req.query.limit as string) || 100;
    if (!userId1 || !userId2) return sendError(res, 'userId1 and userId2 required', 400);
    const msgs = await MessageModel.getConversation(userId1, userId2, limit);
    sendSuccess(res, msgs);
  } catch (err) { next(err); }
}

/**
 * Get AI chat history for a patient (with AI bot sentinel ID)
 */
export async function getAIChatHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientUserId } = req.params;
    const AI_BOT_USER_ID = '00000000-0000-0000-0000-000000000001';
    const msgs = await MessageModel.getConversation(patientUserId, AI_BOT_USER_ID, 100);
    sendSuccess(res, msgs);
  } catch (err) { next(err); }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const count = await MessageModel.getUnreadCount(userId);
    sendSuccess(res, { count });
  } catch (err) { next(err); }
}
