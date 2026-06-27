const express = require('express');
const router = express.Router();
const {
  createPlant,
  listPlants,
  deletePlant,
} = require('../controllers/plant.controller');
const { validateCreatePlant } = require('../middlewares/validate-plant.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', validateCreatePlant, asyncHandler(createPlant));
router.get('/', asyncHandler(listPlants));
router.delete('/:id', asyncHandler(deletePlant));

module.exports = router;
