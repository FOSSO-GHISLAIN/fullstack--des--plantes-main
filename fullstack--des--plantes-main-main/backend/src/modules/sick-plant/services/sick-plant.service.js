const SickPlantRepository = require('../repositories/sick-plant.repository');
const AppError = require('../../../shared/utils/app-error');

const VALID_SEVERITIES = ['légère', 'modérée', 'grave'];
const VALID_TREATMENT_STATUSES = ['non_traité', 'en_cours', 'guéri'];

class SickPlantService {
  constructor() {
    this.repository = new SickPlantRepository();
  }

  async createSickPlant(userId, payload) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const sickPlantData = {
      userId,
      plantName: payload.plantName,
      species: payload.species || '',
      symptoms: payload.symptoms,
      severity: payload.severity || 'modérée',
      diagnosisDate: payload.diagnosisDate
        ? new Date(payload.diagnosisDate)
        : new Date(),
      treatment: payload.treatment || '',
      treatmentStatus: payload.treatmentStatus || 'non_traité',
      location: payload.location || '',
      notes: payload.notes || '',
    };

    return this.repository.create(sickPlantData);
  }

  async listSickPlants(userId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }
    return this.repository.findByUserId(userId);
  }

  async getSickPlant(userId, sickPlantId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const sickPlant = await this.repository.findByIdAndUserId(sickPlantId, userId);
    if (!sickPlant) {
      throw new AppError('Fiche plante malade introuvable', 404);
    }

    return sickPlant;
  }

  async updateSickPlant(userId, sickPlantId, payload) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const existing = await this.repository.findByIdAndUserId(sickPlantId, userId);
    if (!existing) {
      throw new AppError('Fiche plante malade introuvable', 404);
    }

    if (payload.severity && !VALID_SEVERITIES.includes(payload.severity)) {
      throw new AppError('Gravité invalide', 400);
    }

    if (
      payload.treatmentStatus &&
      !VALID_TREATMENT_STATUSES.includes(payload.treatmentStatus)
    ) {
      throw new AppError('Statut de traitement invalide', 400);
    }

    const updateData = {};
    if (payload.plantName !== undefined) updateData.plantName = payload.plantName;
    if (payload.species !== undefined) updateData.species = payload.species;
    if (payload.symptoms !== undefined) updateData.symptoms = payload.symptoms;
    if (payload.severity !== undefined) updateData.severity = payload.severity;
    if (payload.diagnosisDate !== undefined)
      updateData.diagnosisDate = new Date(payload.diagnosisDate);
    if (payload.treatment !== undefined) updateData.treatment = payload.treatment;
    if (payload.treatmentStatus !== undefined)
      updateData.treatmentStatus = payload.treatmentStatus;
    if (payload.location !== undefined) updateData.location = payload.location;
    if (payload.notes !== undefined) updateData.notes = payload.notes;

    const updated = await this.repository.update(sickPlantId, updateData);
    if (!updated) {
      throw new AppError('Échec de la mise à jour', 500);
    }

    return updated;
  }

  async deleteSickPlant(userId, sickPlantId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const existing = await this.repository.findByIdAndUserId(sickPlantId, userId);
    if (!existing) {
      throw new AppError('Fiche plante malade introuvable', 404);
    }

    return this.repository.delete(sickPlantId);
  }

  async getStats(userId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const all = await this.repository.findByUserId(userId);
    return {
      total: all.length,
      légère: all.filter((p) => p.severity === 'légère').length,
      modérée: all.filter((p) => p.severity === 'modérée').length,
      grave: all.filter((p) => p.severity === 'grave').length,
      guéri: all.filter((p) => p.treatmentStatus === 'guéri').length,
      en_cours: all.filter((p) => p.treatmentStatus === 'en_cours').length,
      non_traité: all.filter((p) => p.treatmentStatus === 'non_traité').length,
    };
  }
}

module.exports = SickPlantService;
