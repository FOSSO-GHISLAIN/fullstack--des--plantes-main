const SickPlantService = require('../services/sick-plant.service');
const AppNotificationService = require('../../notification/services/app-notification.service');
const { publishSickPlantRegistered, publishSickPlantHealed } = require('../events/sick-plant.events');
const AppError = require('../../../shared/utils/app-error');

const sickPlantService = new SickPlantService();
const appNotificationService = new AppNotificationService();

/**
 * POST /api/sick-plants
 * Créer une nouvelle fiche plante malade
 */
const createSickPlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const sickPlant = await sickPlantService.createSickPlant(userId, req.validated);
  publishSickPlantRegistered(sickPlant);

  res.status(201).json({
    status: 'success',
    message: 'Plante malade enregistrée avec succès',
    data: sickPlant,
  });
};

/**
 * GET /api/sick-plants
 * Lister toutes les plantes malades de l'utilisateur
 */
const listSickPlants = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const sickPlants = await sickPlantService.listSickPlants(userId);

  res.status(200).json({
    status: 'success',
    data: sickPlants,
  });
};

/**
 * GET /api/sick-plants/:id
 * Récupérer une fiche spécifique
 */
const getSickPlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const sickPlant = await sickPlantService.getSickPlant(userId, req.params.id);

  res.status(200).json({
    status: 'success',
    data: sickPlant,
  });
};

/**
 * PATCH /api/sick-plants/:id
 * Mettre à jour une fiche (traitement, statut, etc.)
 */
const updateSickPlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const updated = await sickPlantService.updateSickPlant(userId, req.params.id, req.validated);

  // Si la plante est guérie, publier l'événement
  if (updated.treatmentStatus === 'guéri') {
    publishSickPlantHealed(updated);
  }

  res.status(200).json({
    status: 'success',
    message: 'Fiche mise à jour avec succès',
    data: updated,
  });
};

/**
 * DELETE /api/sick-plants/:id
 * Supprimer une fiche plante malade
 */
const deleteSickPlant = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  await sickPlantService.deleteSickPlant(userId, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Fiche plante malade supprimée avec succès',
  });
};

/**
 * GET /api/sick-plants/stats
 * Obtenir les statistiques des plantes malades
 */
const getSickPlantStats = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const stats = await sickPlantService.getStats(userId);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
};

/**
 * POST /api/sick-plants/check-reminders
 * Vérifie les plantes en traitement et envoie des rappels si nécessaire
 */
const checkTreatmentReminders = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const { remindersCreated } = await sickPlantService.checkTreatmentReminders(
    userId,
    appNotificationService
  );

  res.status(200).json({
    status: 'success',
    data: { remindersCreated },
  });
};

module.exports = {
  createSickPlant,
  listSickPlants,
  getSickPlant,
  updateSickPlant,
  deleteSickPlant,
  getSickPlantStats,
  checkTreatmentReminders,
};
