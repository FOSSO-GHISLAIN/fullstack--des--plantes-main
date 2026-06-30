const notificationRouter = require('./routes/notification.routes');
const appNotificationRouter = require('./routes/app-notification.routes');
const { registerNotificationEvents } = require('./events/notification.events');

const initNotificationModule = () => {
  registerNotificationEvents();
};

module.exports = {
  notificationRouter,
  appNotificationRouter,
  initNotificationModule,
};
