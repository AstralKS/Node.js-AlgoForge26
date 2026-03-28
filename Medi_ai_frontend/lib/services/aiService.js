import { api } from '../api';

export async function analyzeSymptoms(text, patientId) {
  return api.post('/ai/analyze', { text, patient_id: patientId });
}

export async function generateWeeklyReport(patientId) {
  return api.post('/ai/weekly-report', { patient_id: patientId });
}

export async function evaluateRisk(patientId) {
  return api.post('/ai/risk-eval', { patient_id: patientId });
}

export async function getReports(patientId) {
  return api.get(`/ai/reports/patient/${patientId}`);
}

export async function getAlerts(userId, role = 'patient') {
  return api.get('/ai/alerts', { userId, role });
}

export async function markAlertRead(id) {
  return api.post(`/ai/alerts/${id}/read`);
}
