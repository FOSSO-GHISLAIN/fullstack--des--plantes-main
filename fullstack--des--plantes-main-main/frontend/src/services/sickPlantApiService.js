// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Effectue une requête HTTP vers l'API backend
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Erreur HTTP ${response.status}`);
  }

  return data;
}

/**
 * Ajoute le token d'authentification dans les headers
 */
function withAuth(token, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

// ─── CRUD Plantes Malades ─────────────────────────────────────────────────────

/**
 * Créer une nouvelle fiche plante malade
 * POST /api/sick-plants
 */
export async function createSickPlant(data, token) {
  return apiRequest('/sick-plants', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
}

/**
 * Lister toutes les fiches de l'utilisateur
 * GET /api/sick-plants
 */
export async function getSickPlants(token) {
  return apiRequest('/sick-plants', {
    method: 'GET',
    headers: withAuth(token),
  });
}

/**
 * Obtenir une fiche spécifique
 * GET /api/sick-plants/:id
 */
export async function getSickPlantById(id, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'GET',
    headers: withAuth(token),
  });
}

/**
 * Mettre à jour une fiche (traitement, statut, etc.)
 * PATCH /api/sick-plants/:id
 */
export async function updateSickPlant(id, data, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
}

/**
 * Supprimer une fiche plante malade
 * DELETE /api/sick-plants/:id
 */
export async function deleteSickPlant(id, token) {
  return apiRequest(`/sick-plants/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
}

/**
 * Obtenir les statistiques des plantes malades
 * GET /api/sick-plants/stats
 */
export async function getSickPlantStats(token) {
  return apiRequest('/sick-plants/stats', {
    method: 'GET',
    headers: withAuth(token),
  });
}

/**
 * Vérifier la disponibilité de l'API backend
 * GET /api/health
 */
export async function checkApiHealth() {
  try {
    const data = await apiRequest('/health', { method: 'GET' });
    return { online: true, message: data.message };
  } catch {
    return { online: false, message: 'API backend hors ligne' };
  }
}
