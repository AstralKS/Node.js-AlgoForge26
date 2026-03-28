// Send WhatsApp message via backend API
const TO = process.argv[2] || '+919876543212';
const MSG = process.argv[3] || 'Hi from MediAI! How are you feeling today? Please share any symptoms, BP readings, or medication updates.';

async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: TO, message: MSG }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
