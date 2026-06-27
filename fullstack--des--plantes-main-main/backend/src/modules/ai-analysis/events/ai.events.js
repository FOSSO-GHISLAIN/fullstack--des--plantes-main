const eventBus = require('../../../shared/events/event-bus');
const { MONITORING_EVENTS } = require('../../monitoring/events/monitoring.events');

const AI_EVENTS = {
  DISEASE_DETECTED: 'DISEASE_DETECTED',
};

const publishDiseaseDetected = (payload) => {
  eventBus.emit(AI_EVENTS.DISEASE_DETECTED, payload);
};

const registerAiEvents = () => {
  const AiService = require('../services/ai.service');
  const aiService = new AiService();

  eventBus.on(MONITORING_EVENTS.SENSOR_DATA_RECEIVED, async (payload) => {
    if (!payload || !payload.plantId) {
      return;
    }

    setImmediate(async () => {
      try {
        await aiService.analyzeSensorTrends(payload.plantId, {
          temperature: payload.temperature,
          humidity: payload.humidity,
          soilMoisture: payload.soilMoisture,
          light: payload.light,
        });
      } catch (error) {
        console.error(
          'Erreur lors de l\'analyse asynchrone des capteurs:',
          error.message
        );
      }
    });
  });
};

module.exports = {
  AI_EVENTS,
  publishDiseaseDetected,
  registerAiEvents,
};
