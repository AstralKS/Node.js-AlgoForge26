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
// ── Core OpenRouter Call (Fallback) ──────────────────────
async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  jsonMode = true
): Promise<any> {
  const primary = getRotatedConfig();
  try {
    return await makeRequest(primary.apiKey, primary.model, systemPrompt, userMessage, jsonMode);
  } catch (err: any) {
    logger.warn(`⚠️ Primary OpenRouter call failed, trying fallback...`);
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
  logger.info(`🌐 Calling OpenRouter fallback: model=${model}`);
  const requestBody: any = {
    model,
    messages: [
      { role: 'system', content: systemPrompt + (jsonMode ? '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanations.' : '') },
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
    throw new Error(`OpenRouter ${response.status}: ${errorBody}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response from OpenRouter');

  if (jsonMode) {
    try {
      const cleaned = content.replace(/```json\s*|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      const objMatch = content.match(/\{[\s\S]*\}/);
      if (objMatch) {
         try { return JSON.parse(objMatch[0]); } catch {}
      }
      return { raw_response: content, parse_error: true };
    }
  }
  return content;
}

/**
 * Core Gemini (Google AI Studio) Call
 */
async function callGemini(
  systemPrompt: string,
  userMessage: string,
  jsonMode = true
): Promise<any> {
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    logger.warn('⚠️ GOOGLE_AI_STUDIO_API_KEY not found, falling back to OpenRouter');
    return callOpenRouter(systemPrompt, userMessage, jsonMode);
  }

  logger.info(`🌐 Calling Google Gemini API`);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt + (jsonMode ? '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanations.' : '') },
          { text: userMessage }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`Gemini API error ${response.status}: ${errorBody}`);
    // Fallback to OpenRouter if Gemini fails
    logger.warn('⚠️ Gemini call failed, falling back to OpenRouter...');
    return callOpenRouter(systemPrompt, userMessage, jsonMode);
  }

  const data = await response.json() as any;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    logger.error('Empty Gemini response. Full response:', JSON.stringify(data));
    throw new Error('Empty Gemini response');
  }

  logger.info(`Gemini raw response (first 200 chars): ${content.substring(0, 200)}`);

  if (jsonMode) {
    try {
      // Clean up markdown if Gemini ignored the instruction
      const cleaned = content.replace(/```json\s*|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      const objMatch = content.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch {}
      }
      logger.warn('Could not parse Gemini response as JSON, returning raw');
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

  return await callGemini(systemPrompt, userMsg);
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

  return await callGemini(systemPrompt, rawMessage);
}

/**
 * Chat with Gemini (conversational, no JSON mode)
 */
export async function callGeminiChat(systemPrompt: string, userMessage: string): Promise<string> {
  return await callGemini(systemPrompt, userMessage, false);
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

  return await callGemini(systemPrompt, JSON.stringify(patientData));
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

  return await callGemini(systemPrompt, JSON.stringify(data));
}

/**
 * Generate a clinical SOAP note from a consultation transcript
 */
export async function generateSOAPNote(transcript: string) {
  const systemPrompt = `You are a medical scribe AI. Convert the following consultation transcript into a professional SOAP note.
  
Return JSON with this exact structure:
{
  "subjective": "string — patient's reported symptoms, history, and concerns",
  "objective": "string — vital signs, physical exam findings, and observations from the transcript",
  "assessment": "string — clinical impression and potential diagnoses",
  "plan": "string — diagnostic tests, treatments, and follow-up instructions",
  "summary": "string — brief non-technical summary"
}

IMPORTANT: Be concise and professional. If information is missing from the transcript, use "N/A". Respond ONLY with valid JSON.`;

  return await callGemini(systemPrompt, transcript);
}
