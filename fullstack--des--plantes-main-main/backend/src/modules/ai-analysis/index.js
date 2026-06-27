const aiRouter = require('./routes/ai.routes');
const { registerAiEvents } = require('./events/ai.events');

const initAiModule = () => {
  registerAiEvents();
};

module.exports = {
  aiRouter,
  initAiModule,
};
