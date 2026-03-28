import { api } from '../api';

export async function getMedicationsByPatient(patientId) {
  return api.get(`/medications/patient/${patientId}`);
}

export async function getActiveMedications(patientId) {
  return api.get(`/medications/patient/${patientId}/active`);
}

export async function getAdherenceRate(patientId, days = 30) {
  return api.get(`/medications/patient/${patientId}/adherence`, { days });
}

export async function createMedication(data) {
  return api.post('/medications', data);
}

export async function deleteMedication(id) {
  return api.delete(`/medications/${id}`);
}

export async function logMedication(data) {
  return api.post('/medications/log', data);
}

export async function getMedicationLogs(patientId) {
  return api.get(`/medications/log/patient/${patientId}`);
}
