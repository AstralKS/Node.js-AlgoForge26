// Update patient WhatsApp number directly via Supabase, then send message
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqhlpspnbfqeddbfnekr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VkDoef46Dhvtd1KeRbpZjQ_7EQTaXtn';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // 1. Get patient
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amit@example.com', role: 'patient' }),
  });
  const loginData = await loginRes.json();
  const patientId = loginData.data.profile.id;
  console.log('Patient ID:', patientId);
  console.log('Current WA:', loginData.data.profile.whatsapp_number);

  // 2. Update WhatsApp number directly in Supabase
  const { data: updated, error } = await supabase
    .from('patients')
    .update({ whatsapp_number: '+919518979027' })
    .eq('id', patientId)
    .select()
    .single();
  
  if (error) {
    console.log('❌ Update error:', error.message);
  } else {
    console.log('✅ Updated WA number to:', updated.whatsapp_number);
  }

  // 3. Send WhatsApp message  
  const sendRes = await fetch('http://localhost:3000/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: '+919518979027',
      message: '🏥 MediAI Health Check\n\nHi! How are you feeling today?\n\nPlease share:\n• Any symptoms\n• BP/sugar readings\n• Did you take meds?\n\nReply with your update!',
    }),
  });
  const sendData = await sendRes.json();
  console.log('Send status:', sendRes.status);
  console.log('Send result:', JSON.stringify(sendData, null, 2));
}

main().catch(e => console.error('ERROR:', e.message));
