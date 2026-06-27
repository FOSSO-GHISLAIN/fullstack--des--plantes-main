const PlantRepository = require('../repositories/plant.repository');
const AppError = require('../../../shared/utils/app-error');

const VALID_STATUSES = ['healthy', 'warning', 'sick', 'dead'];

class PlantService {
  constructor() {
    this.repository = new PlantRepository();
  }

  async createPlant(userId, payload) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const plantData = {
      userId,
      name: payload.name,
      species: payload.species,
      status: payload.status || 'healthy',
      thresholds: payload.thresholds || {},
    };

    return this.repository.create(plantData);
  }

  async listPlantsForUser(userId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    return this.repository.findByUserId(userId);
  }

  async deletePlant(userId, plantId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const plant = await this.repository.findById(plantId);
    if (!plant) {
      throw new AppError('Plante introuvable', 404);
    }

    if (plant.userId.toString() !== userId.toString()) {
      throw new AppError('Accès refusé', 403);
    }

    return this.repository.delete(plantId);
  }

  async updateStatus(plantId, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError('Statut de plante invalide', 400);
    }

    const updatedPlant = await this.repository.updateStatus(plantId, status);
    if (!updatedPlant) {
      throw new AppError('Plante introuvable', 404);
    }

    return updatedPlant;
  }
}

module.exports = PlantService;
