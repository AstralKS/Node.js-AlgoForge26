import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Proxy client for the Python FastAPI AI Service.
 * Provides typed methods for each AI endpoint.
 */

const AI_BASE = env.AI_SERVICE_URL;

async function callAIService(
  method: 'GET' | 'POST',
  path: string,
  body?: any,
  timeoutMs = 60000
): Promise<any> {
  const url = `${AI_BASE}${path}`;
  logger.info(`🧠 AI Service → ${method} ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const opts: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(url, opts);

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`AI Service error ${response.status}: ${errorBody}`);
      throw new Error(`AI Service ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    logger.info(`🧠 AI Service response received from ${path}`);
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      logger.error(`AI Service timeout on ${path}`);
      throw new Error(`AI Service timeout on ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Health Check ─────────────────────────────────────────
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const result = await callAIService('GET', '/api/health', undefined, 5000);
    return result?.status === 'ok';
  } catch {
    return false;
  }
}

// ── Symptom Analysis ─────────────────────────────────────
export async function aiAnalyzeSymptoms(patientId: string, text: string, history?: string) {
  return callAIService('POST', '/api/analyze/symptoms', {
    patient_id: patientId,
    text,
    patient_history: history,
  });
}

// ── WhatsApp Processing ──────────────────────────────────
// Longer timeout: full pipeline = intent + extract + analyze + misdiag check (4 LLM calls)
export async function aiProcessWhatsApp(patientId: string, message: string, fromNumber?: string) {
  return callAIService('POST', '/api/whatsapp/process', {
    patient_id: patientId,
    message,
    from_number: fromNumber,
  }, 180_000); // 3 minutes for multi-step pipeline
}

// ── Weekly Report ────────────────────────────────────────
// Longer timeout: fetches DB data + builds report + insights + doctor summary (2-3 LLM calls)
export async function aiGenerateWeeklyReport(patientId: string) {
  return callAIService('POST', '/api/reports/weekly/generate', {
    patient_id: patientId,
  }, 120_000); // 2 minutes
}

export async function aiGetWeeklyReport(patientId: string) {
  return callAIService('GET', `/api/reports/weekly/${patientId}`);
}

// ── Risk Evaluation ──────────────────────────────────────
export async function aiEvaluateRisk(patientId: string, symptoms?: string[]) {
  return callAIService('POST', '/api/risk/evaluate', {
    patient_id: patientId,
    symptoms,
  });
}

// ── Transcription ────────────────────────────────────────
// Note: Transcription requires multipart/form-data with audio file.
// This is handled separately if needed.
export async function aiTranscribe(audioBuffer: Buffer, filename: string) {
  const formData = new FormData();
  const blob = new Blob([audioBuffer]);
  formData.append('file', blob, filename);

  const url = `${AI_BASE}/api/transcribe`;
  logger.info(`🧠 AI Service → POST ${url} (audio transcription)`);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI Service transcription error ${response.status}: ${errorBody}`);
  }

  return response.json();
}
