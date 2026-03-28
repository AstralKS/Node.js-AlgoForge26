import { api } from '../api';

export async function getBiometricsByPatient(patientId, type, limit = 50) {
  const params = { limit };
  if (type) params.type = type;
  return api.get(`/biometrics/patient/${patientId}`, params);
}

export async function getRecentBiometrics(patientId, days = 7) {
  return api.get(`/biometrics/patient/${patientId}/recent`, { days });
}

export async function createBiometric(data) {
  return api.post('/biometrics', data);
}

export async function deleteBiometric(id) {
  return api.delete(`/biometrics/${id}`);
}
