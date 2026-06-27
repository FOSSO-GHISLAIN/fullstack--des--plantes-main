const eventBus = require('../../../shared/events/event-bus');

const SICK_PLANT_EVENTS = {
  SICK_PLANT_REGISTERED: 'SICK_PLANT_REGISTERED',
  SICK_PLANT_HEALED: 'SICK_PLANT_HEALED',
  SICK_PLANT_DELETED: 'SICK_PLANT_DELETED',
};

// ─── Publishers ──────────────────────────────────────────────────────────────
const publishSickPlantRegistered = (sickPlant) => {
  eventBus.emit(SICK_PLANT_EVENTS.SICK_PLANT_REGISTERED, sickPlant);
};

const publishSickPlantHealed = (sickPlant) => {
  eventBus.emit(SICK_PLANT_EVENTS.SICK_PLANT_HEALED, sickPlant);
};

const publishSickPlantDeleted = (sickPlantId) => {
  eventBus.emit(SICK_PLANT_EVENTS.SICK_PLANT_DELETED, { sickPlantId });
};

// ─── Listeners ───────────────────────────────────────────────────────────────
const registerSickPlantEvents = () => {
  eventBus.on(SICK_PLANT_EVENTS.SICK_PLANT_REGISTERED, (sickPlant) => {
    console.log(
      `[SickPlant] 🤒 Nouvelle plante malade enregistrée : "${sickPlant.plantName}" (gravité: ${sickPlant.severity})`
    );
  });

  eventBus.on(SICK_PLANT_EVENTS.SICK_PLANT_HEALED, (sickPlant) => {
    console.log(
      `[SickPlant] 💚 Plante guérie : "${sickPlant.plantName}"`
    );
  });

  eventBus.on(SICK_PLANT_EVENTS.SICK_PLANT_DELETED, ({ sickPlantId }) => {
    console.log(`[SickPlant] 🗑️ Fiche supprimée : ${sickPlantId}`);
  });
};

module.exports = {
  SICK_PLANT_EVENTS,
  publishSickPlantRegistered,
  publishSickPlantHealed,
  publishSickPlantDeleted,
  registerSickPlantEvents,
};
