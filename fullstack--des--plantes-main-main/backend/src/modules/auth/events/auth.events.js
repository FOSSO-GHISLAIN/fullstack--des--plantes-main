const eventBus = require('../../../shared/events/event-bus');
const AUTH_EVENTS = require('./auth.events.constants');

const publishUserRegistered = (user) => {
  eventBus.emit(AUTH_EVENTS.USER_REGISTERED, {
    userId: user._id,
    email: user.email,
    createdAt: user.createdAt,
  });
};

const publishUserLoggedIn = (user) => {
  eventBus.emit(AUTH_EVENTS.USER_LOGGED_IN, {
    userId: user._id,
    email: user.email,
    timestamp: new Date(),
  });
};

const registerAuthEvents = () => {
  // Module-local event listeners can be added here if needed.
};

module.exports = {
  publishUserRegistered,
  publishUserLoggedIn,
  registerAuthEvents,
};
