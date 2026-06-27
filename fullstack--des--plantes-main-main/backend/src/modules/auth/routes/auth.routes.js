const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} = require('../middlewares/validate-auth.middleware');

router.post('/auth/register', validateRegister, register);
router.post('/auth/login', validateLogin, login);
router.post('/auth/refresh', validateRefreshToken, refreshToken);

module.exports = router;
