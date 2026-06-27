const monitoringRouter = require('./routes/monitoring.routes');
const { registerMonitoringEvents } = require('./events/monitoring.events');

const initMonitoringModule = () => {
  registerMonitoringEvents();
};

module.exports = {
  monitoringRouter,
  initMonitoringModule,
};
