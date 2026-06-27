const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

const plantIdSchema = z.object({
  plantId: z.string().min(1, "L'identifiant de la plante est requis"),
});

const validatePlantId = (req, res, next) => {
  try {
    req.validated = plantIdSchema.parse({ plantId: req.params.plantId });
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Identifiant de plante invalide';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validatePlantId,
};
