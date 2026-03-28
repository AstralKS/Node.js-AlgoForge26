import { api } from '../api';

export async function getSymptomsByPatient(patientId, limit = 50) {
  return api.get(`/symptoms/patient/${patientId}`, { limit });
}

export async function getRecentSymptoms(patientId, days = 7) {
  return api.get(`/symptoms/patient/${patientId}/recent`, { days });
}

export async function getSymptomById(id) {
  return api.get(`/symptoms/${id}`);
}

export async function createSymptom(data) {
  return api.post('/symptoms', data);
}

export async function deleteSymptom(id) {
  return api.delete(`/symptoms/${id}`);
}
