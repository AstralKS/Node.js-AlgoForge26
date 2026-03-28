import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── Rotation State ───────────────────────────────────────
let callCount = 0;

function getRotatedConfig() {
  const index = callCount % 2;
  callCount++;

  const apiKey = index === 0 ? env.OPENROUTER_API_KEY_1 : env.OPENROUTER_API_KEY_2;
  const model = index === 0 ? env.OPENROUTER_MODEL_1 : env.OPENROUTER_MODEL_2;

  logger.info(`🤖 AI call #${callCount} → key=${index + 1}, model=${model}`);
  return { apiKey, model };
}

// ── Core OpenRouter Call ─────────────────────────────────
async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  jsonMode = true
): Promise<any> {
  const primary = getRotatedConfig();

  try {
    return await makeRequest(primary.apiKey, primary.model, systemPrompt, userMessage, jsonMode);
  } catch (err: any) {
    logger.warn(`⚠️ Primary call failed (key=${callCount % 2 === 0 ? 1 : 2}), trying fallback...`);
    // Fallback to the other key+model
    const fallback = getRotatedConfig();
    return await makeRequest(fallback.apiKey, fallback.model, systemPrompt, userMessage, jsonMode);
  }
}

async function makeRequest(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  jsonMode: boolean
): Promise<any> {
  logger.info(`🌐 Calling OpenRouter: model=${model}`);

  const requestBody: any = {
    model,
    messages: [
      { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanations.' },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mediai.app',
      'X-Title': 'MediAI',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`OpenRouter error ${response.status}: ${errorBody}`);
    throw new Error(`OpenRouter ${response.status}: ${errorBody}`);
  }

  const data = await response.json() as any;
  logger.info(`OpenRouter response received, choices: ${data.choices?.length || 0}`);

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    logger.error('Empty AI response. Full response:', JSON.stringify(data));
    throw new Error('Empty AI response');
  }

  logger.info(`AI raw response (first 200 chars): ${content.substring(0, 200)}`);

  if (jsonMode) {
    // Try direct parse first
    try {
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[1].trim()); } catch {}
      }
      // Try to find JSON object in response
      const objMatch = content.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch {}
      }
      // Return raw content as fallback
      logger.warn('Could not parse AI response as JSON, returning raw');
      return { raw_response: content, parse_error: true };
    }
  }

  return content;
}

// ── Public API ───────────────────────────────────────────

/**
 * Analyze symptoms from WhatsApp/manual input and return structured data
 */
export async function analyzeSymptoms(rawText: string, patientHistory?: string) {
  const systemPrompt = `You are a medical AI assistant for MediAI. Analyze the patient's symptom description and return structured JSON.

IMPORTANT: You are NOT diagnosing. You are extracting and structuring symptom data for a doctor to review.

Return JSON with this exact structure:
{
  "symptoms": [
    {
      "name": "string — symptom name",
      "description": "string — detailed description",
      "severity": "number 1-10",
      "duration": "string — how long",
      "body_area": "string — affected area"
    }
  ],
  "risk_indicators": ["string — any warning signs"],
  "risk_level": "low | medium | high | critical",
  "recommended_actions": ["string — suggested next steps"],
  "requires_urgent_attention": false,
  "summary": "string — brief clinical summary"
}`;

  const userMsg = patientHistory
    ? `Patient History:\n${patientHistory}\n\nCurrent Report:\n${rawText}`
    : rawText;

  return await callOpenRouter(systemPrompt, userMsg);
}

/**
 * Format raw WhatsApp message into structured patient data
 */
export async function formatWhatsAppData(rawMessage: string) {
  const systemPrompt = `You are a medical data extraction AI. Parse the patient's WhatsApp message and extract structured health data.

Return JSON with this exact structure:
{
  "type": "symptom | biometric | medication_update | general",
  "extracted_data": {
    "symptoms": [{"name": "string", "severity": "number 1-10", "description": "string"}],
    "biometrics": [{"type": "bp | glucose | heart_rate | temperature | weight | spo2", "value": "string", "unit": "string"}],
    "medication_updates": [{"name": "string", "taken": true, "notes": "string"}]
  },
  "patient_mood": "string",
  "urgency": "low | medium | high | critical",
  "needs_doctor_attention": false,
  "ai_notes": "string — any observations"
}`;

  return await callOpenRouter(systemPrompt, rawMessage);
}

/**
 * Generate weekly health report for a patient
 */
export async function generateWeeklyReport(patientData: {
  symptoms: any[];
  biometrics: any[];
  medicationLogs: any[];
  previousReports?: any[];
}) {
  const systemPrompt = `You are a medical AI generating a weekly health report. Analyze the patient's data from the past week.

Return JSON with this exact structure:
{
  "summary": "string — 2-3 paragraph overview of the week",
  "risk_level": "low | medium | high | critical",
  "key_findings": ["string"],
  "trends": {
    "improving": ["string — things getting better"],
    "worsening": ["string — things getting worse"],
    "stable": ["string — unchanged metrics"]
  },
  "medication_adherence": "number — percentage",
  "recommendations": {
    "for_patient": ["string — lifestyle/action recommendations"],
    "for_doctor": ["string — clinical recommendations"]
  },
  "alerts": [{"type": "critical | warning | info", "message": "string"}]
}`;

  return await callOpenRouter(systemPrompt, JSON.stringify(patientData));
}

/**
 * Evaluate misdiagnosis risk based on symptom progression
 */
export async function evaluateRisk(data: {
  currentDiagnosis: string;
  symptoms: any[];
  biometrics: any[];
  timeline: string;
}) {
  const systemPrompt = `You are a medical AI specializing in misdiagnosis detection. Compare the patient's current symptoms against their diagnosis.

CRITICAL: You must be conservative. Flag only genuine concerns, not minor variations.

Return JSON with this exact structure:
{
  "diagnosis_match_score": "number 0-100 — how well symptoms match diagnosis",
  "concerns": [
    {
      "finding": "string — what doesn't match",
      "explanation": "string — why it's concerning",
      "severity": "low | medium | high | critical"
    }
  ],
  "alternative_considerations": ["string — conditions to rule out"],
  "recommendation": "string — suggested action for doctor",
  "requires_immediate_review": false
}`;

  return await callOpenRouter(systemPrompt, JSON.stringify(data));
}
