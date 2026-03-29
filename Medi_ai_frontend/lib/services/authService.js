import { api } from '../api';

export async function login(email, role = 'patient') {
  return api.post('/auth/login', { email, role });
}

export async function registerPatient(data) {
  return api.post('/auth/register/patient', data);
}

export async function getAllUsers(role) {
  return api.get('/auth/users', role ? { role } : undefined);
}
export async function getPatientProfile(patientId) {
  return api.get(`/auth/patient/${patientId}/full-profile`);
}
