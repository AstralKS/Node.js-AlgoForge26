import { api } from '../api';

export async function getVisitsByPatient(patientId) {
  return api.get(`/visits/patient/${patientId}`);
}

export async function getUpcomingVisits(patientId) {
  return api.get(`/visits/patient/${patientId}/upcoming`);
}

export async function getVisitById(id) {
  return api.get(`/visits/${id}`);
}

export async function createVisit(data) {
  return api.post('/visits', data);
}

export async function updateVisit(id, data) {
  return api.patch(`/visits/${id}`, data);
}

export async function deleteVisit(id) {
  return api.delete(`/visits/${id}`);
}
