const MonitoringRepository = require('../repositories/monitoring.repository');
const { publishSensorDataReceived } = require('../events/monitoring.events');
const AppError = require('../../../shared/utils/app-error');

class MonitoringService {
  constructor() {
    this.repository = new MonitoringRepository();
  }

  async saveTelemetry(data) {
    if (!data || !data.plantId) {
      throw new AppError('Données de télémétrie invalides', 400);
    }

    const sensorData = await this.repository.create(data);
    publishSensorDataReceived(sensorData);

    return sensorData;
  }

  async getLatestReading(plantId) {
    if (!plantId) {
      throw new AppError('Identifiant de plante manquant', 400);
    }

    return this.repository.findLatestByPlantId(plantId);
  }

  async getHistory(plantId, limit = 100) {
    if (!plantId) {
      throw new AppError('Identifiant de plante manquant', 400);
    }

    const normalizedLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const cappedLimit = Math.min(normalizedLimit, 1000);

    return this.repository.findHistoryByPlantId(plantId, cappedLimit);
  }

  async deleteHistoryByPlantId(plantId) {
    if (!plantId) {
      throw new AppError('Identifiant de plante manquant', 400);
    }

    return this.repository.deleteByPlantId(plantId);
  }
}

module.exports = MonitoringService;
