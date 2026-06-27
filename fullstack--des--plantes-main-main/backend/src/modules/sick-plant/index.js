const sickPlantRouter = require('./routes/sick-plant.routes');
const { registerSickPlantEvents } = require('./events/sick-plant.events');

const initSickPlantModule = () => {
  registerSickPlantEvents();
  console.log('✓ Module Sick-Plant initialisé');
};

module.exports = {
  sickPlantRouter,
  initSickPlantModule,
};
