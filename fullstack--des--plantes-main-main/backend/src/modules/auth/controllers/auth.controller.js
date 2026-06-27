const AuthService = require('../services/auth.service');
const { publishUserRegistered, publishUserLoggedIn } = require('../events/auth.events');

const authService = new AuthService();

const register = async (req, res, next) => {
  const { email, password } = req.validated;
  const user = await authService.register(email, password);
  publishUserRegistered(user);
  res.status(201).json({
    status: 'success',
    message: 'Utilisateur enregistré avec succès',
    data: { user },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.validated;
  const result = await authService.login(email, password);
  publishUserLoggedIn(result.user);
  res.status(200).json({
    status: 'success',
    message: 'Connexion réussie',
    data: result,
  });
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.validated;
  const tokens = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({
    status: 'success',
    message: 'Token rafraîchi',
    data: { tokens },
  });
};

module.exports = {
  register,
  login,
  refreshToken,
};
