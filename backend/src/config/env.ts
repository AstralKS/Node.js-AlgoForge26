import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url().default(''),
  SUPABASE_ANON_KEY: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),

  // OpenRouter AI
  OPENROUTER_API_KEY_1: z.string().default(''),
  OPENROUTER_API_KEY_2: z.string().default(''),
  OPENROUTER_MODEL_1: z.string().default('google/gemini-2.0-flash-001'),
  OPENROUTER_MODEL_2: z.string().default('anthropic/claude-3.5-sonnet'),

  // AI Service (Python FastAPI)
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),

  // Twilio WhatsApp
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_WHATSAPP_FROM: z.string().default('whatsapp:+14155238886'),

  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
