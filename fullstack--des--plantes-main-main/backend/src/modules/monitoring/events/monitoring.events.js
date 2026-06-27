const eventBus = require('../../../shared/events/event-bus');
const { PLANT_EVENTS } = require('../../plant/events/plant.events');

const MONITORING_EVENTS = {
  SENSOR_DATA_RECEIVED: 'SENSOR_DATA_RECEIVED',
};

const publishSensorDataReceived = (payload) => {
  eventBus.emit(MONITORING_EVENTS.SENSOR_DATA_RECEIVED, payload);
};

const registerMonitoringEvents = () => {
  const MonitoringService = require('../services/monitoring.service');
  const monitoringService = new MonitoringService();

  eventBus.on(PLANT_EVENTS.PLANT_DELETED, async (payload) => {
    if (!payload || !payload.plantId) {
      return;
    }

    try {
      await monitoringService.deleteHistoryByPlantId(payload.plantId);
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de l\'historique des capteurs pour la plante:',
        error.message
      );
    }
  });
};

module.exports = {
  MONITORING_EVENTS,
  publishSensorDataReceived,
  registerMonitoringEvents,
};
