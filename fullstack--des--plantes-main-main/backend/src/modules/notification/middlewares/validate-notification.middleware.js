const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

const userIdSchema = z.object({
  userId: z.string().min(1, "L'identifiant utilisateur est requis"),
});

const validateUserId = (req, res, next) => {
  try {
    req.validated = userIdSchema.parse({ userId: req.user?.id });
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Identifiant utilisateur invalide';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateUserId,
};
