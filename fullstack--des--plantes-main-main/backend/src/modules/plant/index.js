const plantRouter = require('./routes/plant.routes');
const { registerPlantEvents } = require('./events/plant.events');

const initPlantModule = () => {
  registerPlantEvents();
};

module.exports = {
  plantRouter,
  initPlantModule,
};
