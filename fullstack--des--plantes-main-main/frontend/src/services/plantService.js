import { apiRequest, withAuth } from './apiClient';
import { getToken } from './authService';
import { findPlantInLibrary } from '../data/plantLibrary';

function requireToken() {
  const token = getToken();
  if (!token) throw new Error('Session expirée, veuillez vous reconnecter.');
  return token;
}

export async function getPlants() {
  const token = requireToken();
  const response = await apiRequest('/plants', {
    method: 'GET',
    headers: withAuth(token),
  });
  return response.data || [];
}

export async function addPlant(plantData) {
  const token = requireToken();
  const lib = findPlantInLibrary(plantData.name);

  const payload = {
    name: (plantData.name || '').trim(),
    species: (plantData.species || plantData.name || '').trim(),
    type: plantData.type || lib?.type || 'Autre',
    plantedDate: plantData.plantedDate || new Date().toISOString().split('T')[0],
    soilType: plantData.soilType || lib?.soilType || 'Universel',
    waterNeeds: plantData.waterNeeds || lib?.waterNeeds || 'Modéré',
    height: Number(plantData.height) || 0,
    leafCount: Number(plantData.leafCount) || 0,
    temperature: Number(plantData.temperature) || 22,
    humidity: Number(plantData.humidity) || 60,
    status: plantData.status || 'healthy',
  };

  console.log('[addPlant] payload envoyé:', JSON.stringify(payload));

  if (!payload.name) throw new Error('Le nom de la plante est requis.');

  const response = await apiRequest('/plants', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updatePlant(plantId, updates) {
  const token = requireToken();
  const response = await apiRequest(`/plants/${plantId}`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function addGrowthEntry(plantId, entry) {
  const token = requireToken();
  const response = await apiRequest(`/plants/${plantId}/growth`, {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify({
      date: entry.date || new Date().toISOString().split('T')[0],
      height: Number(entry.height),
      leafCount: Number(entry.leafCount),
      temperature: Number(entry.temperature),
      humidity: Number(entry.humidity),
    }),
  });
  return response.data;
}

export async function deletePlant(plantId) {
  const token = requireToken();
  await apiRequest(`/plants/${plantId}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
}

export async function applyAutomaticDailyGrowth() {
  const token = requireToken();
  const response = await apiRequest('/plants/auto-growth', {
    method: 'POST',
    headers: withAuth(token),
  });
  return response.data;
}

export async function getNotifications() {
  const token = requireToken();
  const response = await apiRequest('/notifications', {
    method: 'GET',
    headers: withAuth(token),
  });
  return response.data || [];
}

export async function addNotification(notification) {
  const token = requireToken();
  const response = await apiRequest('/notifications', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(notification),
  });
  return response.data;
}

export async function markNotificationRead(notifId) {
  const token = requireToken();
  const response = await apiRequest(`/notifications/${notifId}/read`, {
    method: 'PATCH',
    headers: withAuth(token),
  });
  return response.data;
}

export function getDaysSincePlanting(plantedDate) {
  const planted = new Date(plantedDate);
  const now = new Date();
  return Math.max(0, Math.floor((now - planted) / (1000 * 60 * 60 * 24)));
}

export function getPlantStats(plants) {
  const growing = plants.filter((p) => p.height < 50).length;
  const mature = plants.filter((p) => p.height >= 50).length;
  const sick = plants.filter((p) => p.status === 'sick' || p.status === 'warning').length;
  return { total: plants.length, growing, mature, sick };
}
