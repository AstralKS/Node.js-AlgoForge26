const API = '';
let currentPatientId = null;

async function checkAIService() {
  const badge = document.getElementById('ai-status-badge');
  if (!badge) return;
  badge.textContent = '🧠 Checking...';
  badge.style.background = '#333';
  badge.style.color = '#888';
  try {
    const r = await fetch(`${API}/api/ai/service-status`);
    const d = await r.json();
    if (d.ai_service?.status === 'connected') {
      badge.textContent = '🧠 AI Service ✅';
      badge.style.background = '#0d3320';
      badge.style.color = '#4ade80';
    } else {
      badge.textContent = '🧠 AI Offline ⚠️';
      badge.style.background = '#3b2308';
      badge.style.color = '#fbbf24';
    }
  } catch {
    badge.textContent = '🧠 AI Error ❌';
    badge.style.background = '#3b0808';
    badge.style.color = '#f87171';
  }
}

async function init() {
  try {
    const res = await fetch(`${API}/api/auth/users?role=patient`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      const user = data.data[0];
      document.getElementById('patient-name').textContent = user.name;
      const pRes = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, role: 'patient' }) });
      const pData = await pRes.json();
      if (pData.success && pData.data.profile) { currentPatientId = pData.data.profile.id; loadAllData(); checkAIService(); }
    } else { document.getElementById('patient-name').textContent = 'No patients — seed data first'; }
  } catch { document.getElementById('patient-name').textContent = 'Server offline'; }
}

function loadAllData() { if (!currentPatientId) return; loadSymptoms(); loadMedications(); loadBiometrics(); loadReports(); }

function showTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
  document.getElementById(`tab-${name}`).style.display = 'block';
  el.classList.add('active');
}

async function logSymptom() {
  if (!currentPatientId) return toast('No patient loaded', 'error');
  const body = { patient_id: currentPatientId, description: document.getElementById('symptom-desc').value, severity: parseInt(document.getElementById('symptom-severity').value), source: document.getElementById('symptom-source').value, run_ai_analysis: document.getElementById('symptom-ai').checked };
  if (!body.description) return toast('Enter description', 'error');
  try { const r = await fetch(`${API}/api/symptoms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (d.success) { toast('Symptom logged!', 'success'); document.getElementById('symptom-desc').value = ''; loadSymptoms(); } else toast(d.error?.message, 'error'); } catch (e) { toast(e.message, 'error'); }
}

async function loadSymptoms() {
  if (!currentPatientId) return;
  try {
    const r = await fetch(`${API}/api/symptoms/patient/${currentPatientId}`); const d = await r.json();
    if (d.success) {
      document.getElementById('stat-symptoms').textContent = d.data.length;
      const html = d.data.map(s => `<div class="card"><div style="display:flex;justify-content:space-between"><div><p>${s.description}</p><p style="font-size:12px;color:var(--text-muted);margin-top:4px">${new Date(s.date).toLocaleString()} · ${s.source}</p></div><span style="color:${s.severity>=7?'var(--accent-danger)':s.severity>=4?'var(--accent-warning)':'var(--accent-success)'}; font-weight:700">${s.severity}/10</span></div>${s.ai_analysis?`<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:var(--accent-primary)">🤖 AI Analysis</summary><pre class="json-output" style="margin-top:8px">${JSON.stringify(s.ai_analysis,null,2)}</pre></details>`:''}</div>`).join('');
      document.getElementById('symptom-list').innerHTML = html || '<div class="empty-state">No symptoms</div>';
      document.getElementById('recent-symptoms').innerHTML = html || '';
    }
  } catch {}
}

async function addMedication() {
  if (!currentPatientId) return toast('No patient', 'error');
  const body = { patient_id: currentPatientId, name: document.getElementById('med-name').value, dosage: document.getElementById('med-dosage').value, frequency: document.getElementById('med-frequency').value, start_date: document.getElementById('med-start').value || new Date().toISOString().split('T')[0] };
  if (!body.name) return toast('Enter name', 'error');
  try { const r = await fetch(`${API}/api/medications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (d.success) { toast('Added!', 'success'); loadMedications(); } else toast(d.error?.message, 'error'); } catch (e) { toast(e.message, 'error'); }
}

async function loadMedications() {
  if (!currentPatientId) return;
  try {
    const r = await fetch(`${API}/api/medications/patient/${currentPatientId}/active`); const d = await r.json();
    if (d.success) { document.getElementById('stat-meds').textContent = d.data.length; document.getElementById('medication-list').innerHTML = d.data.map(m => `<div class="card"><h3>💊 ${m.name}</h3><p>${m.dosage} · ${m.frequency}</p><p style="font-size:12px;color:var(--text-muted)">Since ${m.start_date}</p></div>`).join('') || '<div class="empty-state">No medications</div>'; }
    const ar = await fetch(`${API}/api/medications/patient/${currentPatientId}/adherence`); const ad = await ar.json();
    if (ad.success) document.getElementById('stat-adherence').textContent = ad.data.adherence_rate + '%';
  } catch {}
}

async function logBiometric() {
  if (!currentPatientId) return toast('No patient', 'error');
  const body = { patient_id: currentPatientId, type: document.getElementById('bio-type').value, value: document.getElementById('bio-value').value, unit: document.getElementById('bio-unit').value };
  if (!body.value) return toast('Enter value', 'error');
  try { const r = await fetch(`${API}/api/biometrics`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (d.success) { toast('Logged!', 'success'); loadBiometrics(); } else toast(d.error?.message, 'error'); } catch (e) { toast(e.message, 'error'); }
}

async function loadBiometrics() {
  if (!currentPatientId) return;
  try { const r = await fetch(`${API}/api/biometrics/patient/${currentPatientId}/recent?days=7`); const d = await r.json(); if (d.success) { document.getElementById('biometric-list').innerHTML = d.data.map(b => `<div class="card" style="display:flex;justify-content:space-between;align-items:center"><div><span style="font-weight:600;text-transform:uppercase;font-size:12px;color:var(--accent-primary)">${b.type}</span><p style="font-size:12px;color:var(--text-muted)">${new Date(b.timestamp).toLocaleString()}</p></div><div class="stat-value" style="font-size:24px">${b.value} <span style="font-size:14px;color:var(--text-secondary)">${b.unit}</span></div></div>`).join('') || '<div class="empty-state">No readings</div>'; } } catch {}
}

function autoUnit() { const u = { bp:'mmHg',glucose:'mg/dL',heart_rate:'bpm',temperature:'°F',weight:'kg',spo2:'%'}; document.getElementById('bio-unit').value = u[document.getElementById('bio-type').value]||''; }

async function analyzeText() {
  const text = document.getElementById('ai-text').value; if (!text) return toast('Enter text', 'error');
  document.getElementById('ai-response').innerHTML = '<div style="text-align:center"><div class="spinner"></div><p>Analyzing...</p></div>';
  try { const r = await fetch(`${API}/api/ai/analyze`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text,patient_id:currentPatientId})}); const d = await r.json(); document.getElementById('ai-response').innerHTML = `<h3>🤖 Result</h3><pre class="json-output">${JSON.stringify(d,null,2)}</pre>`; } catch (e) { document.getElementById('ai-response').innerHTML = `<h3>❌ Error</h3><p>${e.message}</p>`; }
}

async function generateReport() {
  if (!currentPatientId) return toast('No patient', 'error');
  document.getElementById('ai-response').innerHTML = '<div style="text-align:center"><div class="spinner"></div><p>Generating...</p></div>';
  try { const r = await fetch(`${API}/api/ai/weekly-report`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({patient_id:currentPatientId})}); const d = await r.json(); document.getElementById('ai-response').innerHTML = `<h3>📊 Report</h3><pre class="json-output">${JSON.stringify(d,null,2)}</pre>`; loadReports(); } catch (e) { document.getElementById('ai-response').innerHTML = `<h3>❌ Error</h3><p>${e.message}</p>`; }
}

async function evaluateRisk() {
  if (!currentPatientId) return toast('No patient', 'error');
  document.getElementById('ai-response').innerHTML = '<div style="text-align:center"><div class="spinner"></div><p>Evaluating...</p></div>';
  try { const r = await fetch(`${API}/api/ai/risk-eval`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({patient_id:currentPatientId})}); const d = await r.json(); document.getElementById('ai-response').innerHTML = `<h3>🎯 Risk</h3><pre class="json-output">${JSON.stringify(d,null,2)}</pre>`; } catch (e) { document.getElementById('ai-response').innerHTML = `<h3>❌ Error</h3><p>${e.message}</p>`; }
}

async function loadReports() {
  if (!currentPatientId) return;
  try { const r = await fetch(`${API}/api/ai/reports/patient/${currentPatientId}`); const d = await r.json(); if (d.success) { document.getElementById('stat-reports').textContent = d.data.length; document.getElementById('ai-reports').innerHTML = d.data.map(r => `<div class="card"><div style="display:flex;justify-content:space-between"><h3>📊 ${r.week_of}</h3><span class="risk-${r.risk_level}">${r.risk_level.toUpperCase()}</span></div><p style="margin-top:8px">${(r.summary||'').substring(0,200)}...</p><p style="font-size:12px;color:var(--text-muted)">${r.signed_by_doctor?'✅ Signed':'⏳ Unsigned'}</p></div>`).join('') || '<div class="empty-state">No reports</div>'; } } catch {}
}

function loadSample(i) {
  const s = ['Doctor sahab I am feeling very tired since 3 days. My body temperature is also high around 101F. Having headache and body pain also.','Good morning. My BP reading today is 140/90. Sugar fasting was 180. Feeling dizzy.','Took my morning medicines - metformin 500mg and amlodipine 5mg. Skipped evening dose yesterday.','I have been having chest pain since last night. It gets worse when I breathe deeply. Should I go to hospital?'];
  document.getElementById('wa-message').value = s[i]||s[0];
}

async function simulateWA() {
  const msg = document.getElementById('wa-message').value; if (!msg) return toast('Enter message', 'error');
  document.getElementById('wa-response').innerHTML = '<div style="text-align:center"><div class="spinner"></div><p>Processing via AI pipeline...</p></div>';
  try {
    const r = await fetch(`${API}/api/whatsapp/simulate`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:msg,patient_id:currentPatientId})});
    const d = await r.json();
    const data = d.data || d;

    let html = '<div>';
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3>📱 WhatsApp Processing Result</h3><span style="font-size:11px;padding:3px 8px;border-radius:8px;background:${data.source==='ai-service'?'#0d3320':'#3b2308'};color:${data.source==='ai-service'?'#4ade80':'#fbbf24'}">${data.source==='ai-service'?'🧠 Full AI Pipeline':'🌐 OpenRouter Fallback'}</span></div>`;

    if (data.intent) {
      html += `<div style="margin-bottom:12px;padding:10px;background:rgba(99,102,241,0.1);border-radius:8px"><strong>Intent:</strong> ${data.intent} ${data.urgency ? `<span style="color:${data.urgency==='critical'?'#f87171':data.urgency==='high'?'#fbbf24':'#4ade80'}">(${data.urgency})</span>` : ''}</div>`;
    }
    if (data.suggested_reply) {
      html += `<div style="margin-bottom:12px;padding:10px;background:rgba(16,185,129,0.1);border-radius:8px"><strong>💬 Suggested Reply:</strong><br/>${data.suggested_reply}</div>`;
    }
    if (data.actions_taken?.length) {
      html += `<div style="margin-bottom:12px;padding:10px;background:rgba(245,158,11,0.1);border-radius:8px"><strong>Actions:</strong><ul style="margin:4px 0 0 16px">${data.actions_taken.map(a => `<li>${a}</li>`).join('')}</ul></div>`;
    }
    html += `<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:var(--accent-primary)">📋 Full JSON Response</summary><pre class="json-output" style="margin-top:8px">${JSON.stringify(d,null,2)}</pre></details>`;
    html += '</div>';

    document.getElementById('wa-response').innerHTML = html;
    loadAllData();
  } catch (e) { document.getElementById('wa-response').innerHTML = `<h3>❌ Error</h3><p>${e.message}</p>`; }
}

function toast(msg, type='info') { const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 3000); }

init();
