import { apiRequest, withAuth } from './apiClient';

export async function createSickPlant(data, token) {
  return apiRequest('/sick-plants', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
}

export async function getSickPlants(token) {
  return apiRequest('/sick-plants', {
    method: 'GET',
    headers: withAuth(token),
  });
}

export async function getSickPlantById(id, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'GET',
    headers: withAuth(token),
  });
}

export async function updateSickPlant(id, data, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
}

export async function deleteSickPlant(id, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
}

export async function getSickPlantStats(token) {
  return apiRequest('/sick-plants/stats', {
    method: 'GET',
    headers: withAuth(token),
  });
}

export async function checkApiHealth() {
  try {
    const data = await apiRequest('/health', { method: 'GET' });
    return { online: true, message: data.message };
  } catch {
    return { online: false, message: 'API backend hors ligne' };
  }
}

export async function checkTreatmentReminders(token) {
  return apiRequest('/sick-plants/check-reminders', {
    method: 'POST',
    headers: withAuth(token),
  });
}
