// Verify all data stored from WhatsApp pipeline — writes to stdout with flush
import { writeFileSync } from 'fs';

async function main() {
  const lines = [];
  const log = (msg) => { lines.push(msg); console.log(msg); };

  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amit@example.com', role: 'patient' }),
  });
  const loginData = await loginRes.json();
  const pid = loginData.data.profile.id;
  log('Patient: ' + loginData.data.user.name + ' | ID: ' + pid);
  log('WA: ' + loginData.data.profile.whatsapp_number);

  // Symptoms
  const sympRes = await fetch('http://localhost:3000/api/symptoms/patient/' + pid + '/recent?days=1');
  const sympData = await sympRes.json();
  const symptoms = sympData.data || [];
  log('\n=== SYMPTOMS (last 24h): ' + symptoms.length + ' ===');
  symptoms.forEach(s => {
    log('  [' + s.source + '] ' + s.description + ' | severity: ' + s.severity);
  });

  // Biometrics
  const bioRes = await fetch('http://localhost:3000/api/biometrics/patient/' + pid + '/recent?days=1');
  const bioData = await bioRes.json();
  const biometrics = bioData.data || [];
  log('\n=== BIOMETRICS (last 24h): ' + biometrics.length + ' ===');
  biometrics.forEach(b => {
    log('  ' + b.type + ': ' + b.value + ' ' + b.unit);
  });

  log('\n=== RESULT ===');
  log('Symptoms from WhatsApp: ' + symptoms.filter(s => s.source === 'whatsapp').length);
  log('Biometrics stored: ' + biometrics.length);
  log(symptoms.length > 0 || biometrics.length > 0 ? 'PIPELINE: VERIFIED OK' : 'PIPELINE: NO DATA YET');

  writeFileSync('verify_result.txt', lines.join('\n'));
}

main().catch(e => console.error('ERROR:', e.message));
