const notificationRouter = require('./routes/notification.routes');
const { registerNotificationEvents } = require('./events/notification.events');

const initNotificationModule = () => {
  registerNotificationEvents();
};

module.exports = {
  notificationRouter,
  initNotificationModule,
};
