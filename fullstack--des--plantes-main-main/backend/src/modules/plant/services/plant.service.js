const PlantRepository = require('../repositories/plant.repository');
const AppError = require('../../../shared/utils/app-error');

const VALID_STATUSES = ['healthy', 'warning', 'sick', 'dead'];

const PLANT_LIBRARY = {
  basilic: { maxHeight: 40, harvestDays: 60 },
  tomate: { maxHeight: 180, harvestDays: 90 },
  menthe: { maxHeight: 50, harvestDays: 45 },
  chêne: { maxHeight: 2000, harvestDays: 3650 },
  fraise: { maxHeight: 25, harvestDays: 75 },
  lavande: { maxHeight: 60, harvestDays: 120 },
};

function findPlantInLibrary(name) {
  const search = (name || '').toLowerCase().trim();
  return PLANT_LIBRARY[search] || null;
}

function parseDateOnly(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(fromDate, toDate) {
  const from = parseDateOnly(fromDate);
  const to = parseDateOnly(toDate);
  return Math.max(0, Math.floor((to - from) / (1000 * 60 * 60 * 24)));
}

function getDailyGrowthRate(plant) {
  const lib = findPlantInLibrary(plant.name);
  if (lib?.maxHeight && lib?.harvestDays) {
    return Math.max(0.1, +(lib.maxHeight / lib.harvestDays).toFixed(2));
  }
  return 0.5;
}

class PlantService {
  constructor() {
    this.repository = new PlantRepository();
  }

  async createPlant(userId, payload) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const today = new Date().toISOString().split('T')[0];
    const plantData = {
      userId,
      name: payload.name,
      species: payload.species || payload.name,
      type: payload.type || 'Autre',
      plantedDate: payload.plantedDate || today,
      soilType: payload.soilType || 'Universel',
      waterNeeds: payload.waterNeeds || 'Modéré',
      height: Number(payload.height) || 0,
      leafCount: Number(payload.leafCount) || 0,
      temperature: Number(payload.temperature) || 22,
      humidity: Number(payload.humidity) || 60,
      status: payload.status || 'healthy',
      thresholds: payload.thresholds || {},
      growthHistory: [
        {
          date: today,
          height: Number(payload.height) || 0,
          leafCount: Number(payload.leafCount) || 0,
          temperature: Number(payload.temperature) || 22,
          humidity: Number(payload.humidity) || 60,
        },
      ],
    };

    return this.repository.create(plantData);
  }

  async listPlantsForUser(userId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    return this.repository.findByUserId(userId);
  }

  async updatePlant(userId, plantId, updates) {
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

    const allowed = [
      'name',
      'species',
      'type',
      'plantedDate',
      'soilType',
      'waterNeeds',
      'height',
      'leafCount',
      'temperature',
      'humidity',
      'status',
      'thresholds',
    ];

    const data = {};
    allowed.forEach((key) => {
      if (updates[key] !== undefined) {
        data[key] = updates[key];
      }
    });

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw new AppError('Statut de plante invalide', 400);
    }

    return this.repository.update(plantId, data);
  }

  async addGrowthEntry(userId, plantId, entry) {
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

    const record = {
      date: entry.date || new Date().toISOString().split('T')[0],
      height: Number(entry.height),
      leafCount: Number(entry.leafCount),
      temperature: Number(entry.temperature),
      humidity: Number(entry.humidity),
    };

    return this.repository.update(plantId, {
      height: record.height,
      leafCount: record.leafCount,
      temperature: record.temperature,
      humidity: record.humidity,
      growthHistory: [...(plant.growthHistory || []), record],
    });
  }

  async applyAutomaticDailyGrowth(userId) {
    const plants = await this.repository.findByUserId(userId);
    if (!plants.length) {
      return { changed: false, updatedPlants: [], plants: [] };
    }

    const today = parseDateOnly(new Date());
    let changed = false;
    const updatedPlants = [];
    const results = [];

    for (const plant of plants) {
      const lib = findPlantInLibrary(plant.name);
      const maxHeight = lib?.maxHeight || 100;
      const dailyGrowth = getDailyGrowthRate(plant);
      const history = [...(plant.growthHistory || [])];

      const lastEntry = history[history.length - 1];
      const lastDate = parseDateOnly(lastEntry?.date || plant.plantedDate || plant.createdAt);
      const daysPassed = daysBetween(lastDate, today);

      if (daysPassed < 1 || plant.height >= maxHeight) {
        results.push(plant);
        continue;
      }

      changed = true;
      let newHeight = plant.height;
      let newLeafCount = plant.leafCount || 0;
      const newHistory = [...history];

      for (let d = 1; d <= daysPassed; d += 1) {
        const entryDate = new Date(lastDate);
        entryDate.setDate(entryDate.getDate() + d);
        const dateStr = entryDate.toISOString().split('T')[0];

        newHeight = Math.min(maxHeight, +(newHeight + dailyGrowth).toFixed(2));
        if (d % 3 === 0) newLeafCount += 1;

        newHistory.push({
          date: dateStr,
          height: newHeight,
          leafCount: newLeafCount,
          temperature: plant.temperature,
          humidity: plant.humidity,
          auto: true,
        });
      }

      const updated = await this.repository.update(plant._id, {
        height: newHeight,
        leafCount: newLeafCount,
        growthHistory: newHistory,
        lastAutoGrowth: today.toISOString().split('T')[0],
      });

      updatedPlants.push({
        name: plant.name,
        addedCm: +(newHeight - plant.height).toFixed(2),
      });
      results.push(updated);
    }

    return { changed, updatedPlants, plants: results };
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
