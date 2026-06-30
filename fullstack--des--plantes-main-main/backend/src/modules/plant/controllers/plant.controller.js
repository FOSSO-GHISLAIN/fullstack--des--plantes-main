const PlantService = require('../services/plant.service');
const AppNotificationService = require('../../notification/services/app-notification.service');
const { publishPlantCreated, publishPlantDeleted } = require('../events/plant.events');
const AppError = require('../../../shared/utils/app-error');
const { toId, toIdList } = require('../../../shared/utils/serialize');

const plantService = new PlantService();
const appNotificationService = new AppNotificationService();

const createPlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const plant = await plantService.createPlant(userId, req.validated);
  publishPlantCreated(plant);

  res.status(201).json({
    status: 'success',
    message: 'Plante créée avec succès',
    data: toId(plant),
  });
};

const listPlants = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  await plantService.applyAutomaticDailyGrowth(userId);
  const plants = await plantService.listPlantsForUser(userId);

  res.status(200).json({
    status: 'success',
    data: toIdList(plants),
  });
};

const updatePlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const plant = await plantService.updatePlant(userId, req.params.id, req.validated);

  res.status(200).json({
    status: 'success',
    message: 'Plante mise à jour',
    data: toId(plant),
  });
};

const addGrowthEntry = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const plant = await plantService.addGrowthEntry(userId, req.params.id, req.validated);

  res.status(200).json({
    status: 'success',
    message: 'Mesure enregistrée',
    data: toId(plant),
  });
};

const deletePlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const deletedPlant = await plantService.deletePlant(userId, req.params.id);
  publishPlantDeleted(deletedPlant?._id || req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Plante supprimée avec succès',
  });
};

const applyAutoGrowth = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const { changed, updatedPlants } = await plantService.applyAutomaticDailyGrowth(userId);

  if (changed) {
    for (const { name, addedCm } of updatedPlants) {
      if (addedCm > 0) {
        await appNotificationService.createNotification(userId, {
          type: 'growth',
          title: 'Croissance automatique',
          message: `${name} a grandi de ${addedCm} cm depuis votre dernière visite.`,
        });
      }
    }
  }

  const plants = await plantService.listPlantsForUser(userId);

  res.status(200).json({
    status: 'success',
    data: {
      changed,
      updatedPlants,
      plants: toIdList(plants),
    },
  });
};

module.exports = {
  createPlant,
  listPlants,
  updatePlant,
  addGrowthEntry,
  deletePlant,
  applyAutoGrowth,
};
