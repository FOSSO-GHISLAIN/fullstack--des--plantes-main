const authRouter = require('./routes/auth.routes');
const { registerAuthEvents } = require('./events/auth.events');

const initAuthModule = () => {
  registerAuthEvents();
};

module.exports = {
  authRouter,
  initAuthModule,
};
