import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── Twilio WhatsApp Service ──────────────────────────────
// Ready for friend's Twilio bot integration

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to: string, body: string) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    logger.warn('⚠️ Twilio not configured — skipping WhatsApp send');
    return { success: false, reason: 'Twilio not configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams({
    From: env.TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${to}`,
    Body: body,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Twilio error:', data);
      throw new Error(`Twilio ${response.status}: ${data.message}`);
    }

    logger.info(`📱 WhatsApp sent to ${to}: ${body.substring(0, 50)}...`);
    return { success: true, sid: data.sid };
  } catch (err: any) {
    logger.error('WhatsApp send failed:', err.message);
    throw err;
  }
}

/**
 * Verify Twilio webhook signature
 */
export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!env.TWILIO_AUTH_TOKEN) return false;

  // Sort params and concatenate
  const sortedKeys = Object.keys(params).sort();
  let dataStr = url;
  for (const key of sortedKeys) {
    dataStr += key + params[key];
  }

  // HMAC-SHA1 verification
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha1', env.TWILIO_AUTH_TOKEN);
  hmac.update(dataStr);
  const expected = hmac.digest('base64');

  return signature === expected;
}

/**
 * Parse incoming Twilio WhatsApp webhook body
 */
export function parseIncomingMessage(body: Record<string, any>) {
  return {
    from: body.From?.replace('whatsapp:', '') || '',
    to: body.To?.replace('whatsapp:', '') || '',
    message: body.Body || '',
    messageSid: body.MessageSid || '',
    numMedia: parseInt(body.NumMedia || '0', 10),
    mediaUrl: body.MediaUrl0 || null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send template-based messages (daily check-in, medication reminder, etc.)
 */
export async function sendTemplateMessage(
  to: string,
  template: 'daily_checkin' | 'medication_reminder' | 'urgent_ack' | 'doctor_forwarded',
  vars: Record<string, string> = {}
) {
  const templates: Record<string, string> = {
    daily_checkin: `🌅 Good morning ${vars.name || 'there'}! How are you feeling today?\n\nPlease share:\n• Any symptoms\n• Your BP/glucose readings\n• Did you take your medications?\n\nReply with your update! 💊`,
    medication_reminder: `💊 Medication Reminder\n\nTime to take: ${vars.medication || 'your medication'}\nDose: ${vars.dosage || 'as prescribed'}\n\nReply "taken" when done, or "skip" with reason.`,
    urgent_ack: `🚨 We've received your urgent message and forwarded it to Dr. ${vars.doctor || 'your doctor'}.\n\nExpect a response soon. If this is a medical emergency, please call 108 or go to the nearest hospital.`,
    doctor_forwarded: `📋 Message forwarded to Dr. ${vars.doctor || 'your doctor'}:\n"${vars.message || ''}"\n\nYou'll receive a response when the doctor replies.`,
  };

  const body = templates[template] || `MediAI: ${template}`;
  return await sendWhatsAppMessage(to, body);
}
