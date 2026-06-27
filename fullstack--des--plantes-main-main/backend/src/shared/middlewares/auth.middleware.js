const jwt = require('jsonwebtoken');
const AppError = require('../utils/app-error');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token d\'authentification manquant', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'plantracker_jwt_secret_key_2024'
    );

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expiré, veuillez vous reconnecter', 401));
    }
    return next(new AppError('Token invalide', 401));
  }
};

module.exports = { authenticate };
