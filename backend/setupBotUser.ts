import { supabaseAdmin } from './src/config/supabase';

async function checkAndFix() {
  const WHATSAPP_BOT_USER_ID = '00000000-0000-0000-0000-000000000001';
  
  // 1. Check if bot user exists
  let { data: botUser, error: botErr } = await supabaseAdmin.from('users').select('*').eq('id', WHATSAPP_BOT_USER_ID).single();
  
  if (!botUser) {
    console.log('🤖 WhatsApp Bot User not found. Creating...');
    const { error: insertErr } = await supabaseAdmin.from('users').insert({
      id: WHATSAPP_BOT_USER_ID,
      role: 'ai_bot',
      name: 'MediAI Assistant',
      email: 'bot@mediai.local'
    });
    if (insertErr) {
      console.error('❌ Failed to create bot user:', insertErr.message);
    } else {
      console.log('✅ Bot user created successfully.');
    }
  } else {
    console.log('✅ Bot user already exists.');
  }

  // 2. Check patients table for whatsapp_number with + prefix
  const { data: patients, error: patErr } = await supabaseAdmin.from('patients').select('id, whatsapp_number');
  if (patErr) {
    console.error('❌ Failed to fetch patients:', patErr.message);
  } else if (patients) {
    let fixedCount = 0;
    for (const p of patients) {
      if (p.whatsapp_number && p.whatsapp_number.startsWith('+')) {
        const fixedNumber = p.whatsapp_number.replace('+', '');
        const { error: upErr } = await supabaseAdmin.from('patients').update({ whatsapp_number: fixedNumber }).eq('id', p.id);
        if (!upErr) {
          fixedCount++;
          console.log(`✅ Fixed formatting for patient ${p.id}. Changed ${p.whatsapp_number} to ${fixedNumber}`);
        }
      }
    }
    console.log(`✅ Processed ${patients.length} patients. Fixed ${fixedCount} WhatsApp numbers.`);
  }

  // 3. Check for any missing UUID in messages that might conflict
  process.exit(0);
}

checkAndFix();
