const express = require('express');
const router = express.Router();
const {
  createSickPlant,
  listSickPlants,
  getSickPlant,
  updateSickPlant,
  deleteSickPlant,
  getSickPlantStats,
  checkTreatmentReminders,
} = require('../controllers/sick-plant.controller');
const {
  validateCreateSickPlant,
  validateUpdateSickPlant,
} = require('../middlewares/validate-sick-plant.middleware');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent un token JWT valide
router.use(authenticate);

// ─── Routes ──────────────────────────────────────────────────────────────────
// GET  /api/sick-plants/stats  — statistiques (avant /:id pour éviter les conflits)
router.get('/stats', asyncHandler(getSickPlantStats));

// POST /api/sick-plants/check-reminders — vérifier et envoyer les rappels de traitement
router.post('/check-reminders', asyncHandler(checkTreatmentReminders));

// POST /api/sick-plants        — créer une fiche
router.post('/', validateCreateSickPlant, asyncHandler(createSickPlant));

// GET  /api/sick-plants        — lister toutes les fiches de l'utilisateur
router.get('/', asyncHandler(listSickPlants));

// GET  /api/sick-plants/:id    — détail d'une fiche
router.get('/:id', asyncHandler(getSickPlant));

// PATCH /api/sick-plants/:id   — mettre à jour une fiche
router.patch('/:id', validateUpdateSickPlant, asyncHandler(updateSickPlant));

// DELETE /api/sick-plants/:id  — supprimer une fiche
router.delete('/:id', asyncHandler(deleteSickPlant));

module.exports = router;
