const AuthRepository = require('../repositories/auth.repository');
const AppError = require('../../../shared/utils/app-error');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async register(email, password) {
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Cet email est déjà enregistré', 400);
    }

    const user = await this.repository.createUser(email, password);
    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  async login(email, password) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    await this.repository.updateLastLogin(user._id);

    const tokens = this.generateTokens(user);
    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      );

      const user = await this.repository.findById(decoded.userId);
      if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new AppError('Refresh token invalide ou expiré', 401);
    }
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      );
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

module.exports = AuthService;
