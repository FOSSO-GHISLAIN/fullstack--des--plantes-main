const MonitoringService = require('../services/monitoring.service');
const AppError = require('../../../shared/utils/app-error');

const monitoringService = new MonitoringService();

const receiveTelemetry = async (req, res, next) => {
  const telemetry = req.validated;
  const sensorData = await monitoringService.saveTelemetry(telemetry);

  res.status(201).json({
    status: 'success',
    message: 'Télémétrie enregistrée avec succès',
    data: sensorData,
  });
};

const getHistory = async (req, res, next) => {
  const { plantId } = req.params;

  if (!plantId) {
    throw new AppError('Identifiant de plante manquant', 400);
  }

  let limit = req.query.limit ? Number(req.query.limit) : 100;
  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 100;
  }

  const history = await monitoringService.getHistory(plantId, limit);

  res.status(200).json({
    status: 'success',
    data: history,
  });
};

const getLatest = async (req, res, next) => {
  const { plantId } = req.params;

  if (!plantId) {
    throw new AppError('Identifiant de plante manquant', 400);
  }

  const latest = await monitoringService.getLatestReading(plantId);

  if (!latest) {
    throw new AppError('Aucune donnée de capteur trouvée pour cette plante', 404);
  }

  res.status(200).json({
    status: 'success',
    data: latest,
  });
};

module.exports = {
  receiveTelemetry,
  getHistory,
  getLatest,
};
