const eventBus = require('../../../shared/events/event-bus');
const PlantService = require('../services/plant.service');

const PLANT_EVENTS = {
  PLANT_CREATED: 'PLANT_CREATED',
  PLANT_DELETED: 'PLANT_DELETED',
  DISEASE_DETECTED: 'DISEASE_DETECTED',
};

const plantService = new PlantService();

const publishPlantCreated = (plant) => {
  eventBus.emit(PLANT_EVENTS.PLANT_CREATED, plant);
};

const publishPlantDeleted = (plantId) => {
  eventBus.emit(PLANT_EVENTS.PLANT_DELETED, { plantId });
};

const registerPlantEvents = () => {
  eventBus.on(PLANT_EVENTS.DISEASE_DETECTED, async (payload) => {
    if (!payload || !payload.plantId) {
      return;
    }

    try {
      await plantService.updateStatus(payload.plantId, 'sick');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la plante après un disease event:', error.message);
    }
  });
};

module.exports = {
  PLANT_EVENTS,
  publishPlantCreated,
  publishPlantDeleted,
  registerPlantEvents,
};
