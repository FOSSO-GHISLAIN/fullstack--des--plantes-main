const express = require('express');
const router = express.Router();
const {
  diagnoseLeafImage,
  getAnalysisHistory,
} = require('../controllers/ai.controller');
const { validatePlantId } = require('../middlewares/validate-analysis.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/diagnose/:plantId', validatePlantId, asyncHandler(diagnoseLeafImage));
router.get('/history/:plantId', validatePlantId, asyncHandler(getAnalysisHistory));

module.exports = router;
