const express = require('express');
const router = express.Router();
const {
  createPlant,
  listPlants,
  updatePlant,
  addGrowthEntry,
  deletePlant,
  applyAutoGrowth,
} = require('../controllers/plant.controller');
const {
  validateCreatePlant,
  validateUpdatePlant,
  validateGrowthEntry,
} = require('../middlewares/validate-plant.middleware');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(authenticate);

router.post('/', validateCreatePlant, asyncHandler(createPlant));
router.get('/', asyncHandler(listPlants));
router.post('/auto-growth', asyncHandler(applyAutoGrowth));
router.patch('/:id', validateUpdatePlant, asyncHandler(updatePlant));
router.post('/:id/growth', validateGrowthEntry, asyncHandler(addGrowthEntry));
router.delete('/:id', asyncHandler(deletePlant));

module.exports = router;
