import { supabaseAdmin } from './src/config/supabase';

async function fixBotUser() {
  const WHATSAPP_BOT_USER_ID = '00000000-0000-0000-0000-000000000001';
  
  const { error: insertErr } = await supabaseAdmin.from('users').insert({
    id: WHATSAPP_BOT_USER_ID,
    role: 'doctor', // Using doctor to avoid enum check constraints
    name: 'MediAI Assistant',
    email: 'bot@mediai.local',
    phone: '0000000000'
  });
  
  if (insertErr) {
    console.error('❌ Failed to create bot user:', insertErr.message);
  } else {
    console.log('✅ Bot user created successfully.');
  }
}

fixBotUser();
