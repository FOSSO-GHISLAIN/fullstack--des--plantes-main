const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[!@#$%^&*]/, 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm'],
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Le refresh token est requis'),
});

const validateRegister = (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    req.validated = {
      email: validated.email,
      password: validated.password,
    };
    next();
  } catch (error) {
    const message = error.errors[0]?.message || 'Erreur de validation';
    next(new AppError(message, 400));
  }
};

const validateLogin = (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    req.validated = validated;
    next();
  } catch (error) {
    const message = error.errors[0]?.message || 'Erreur de validation';
    next(new AppError(message, 400));
  }
};

const validateRefreshToken = (req, res, next) => {
  try {
    const validated = refreshTokenSchema.parse(req.body);
    req.validated = validated;
    next();
  } catch (error) {
    const message = error.errors[0]?.message || 'Erreur de validation';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
};
