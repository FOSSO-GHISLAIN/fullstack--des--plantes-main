const express = require('express');
const router = express.Router();
const {
  receiveTelemetry,
  getHistory,
  getLatest,
} = require('../controllers/monitoring.controller');
const { validateSensorData } = require('../middlewares/validate-sensor.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/telemetry', validateSensorData, asyncHandler(receiveTelemetry));
router.get('/history/:plantId', asyncHandler(getHistory));
router.get('/latest/:plantId', asyncHandler(getLatest));

module.exports = router;
