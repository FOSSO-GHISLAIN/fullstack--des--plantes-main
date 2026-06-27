const PlantService = require('../services/plant.service');
const { publishPlantCreated, publishPlantDeleted } = require('../events/plant.events');
const AppError = require('../../../shared/utils/app-error');

const plantService = new PlantService();

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
    data: plant,
  });
};

const listPlants = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const plants = await plantService.listPlantsForUser(userId);

  res.status(200).json({
    status: 'success',
    data: plants,
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

module.exports = {
  createPlant,
  listPlants,
  deletePlant,
};
