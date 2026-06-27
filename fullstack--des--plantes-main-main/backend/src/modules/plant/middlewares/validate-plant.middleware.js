const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

const thresholdsSchema = z.object({
  minSoilMoisture: z.number().nonnegative('minSoilMoisture doit être positif').optional(),
  maxTemperature: z.number().nonnegative('maxTemperature doit être positif').optional(),
  maxHumidity: z.number().nonnegative('maxHumidity doit être positif').optional(),
  minLight: z.number().nonnegative('minLight doit être positif').optional(),
});

const createPlantSchema = z.object({
  name: z.string().min(1, 'Le nom de la plante est requis'),
  species: z.string().min(1, 'L’espèce de la plante est requise'),
  status: z.enum(['healthy', 'warning', 'sick', 'dead']).optional(),
  thresholds: thresholdsSchema.optional(),
});

const updatePlantSchema = z.object({
  name: z.string().min(1, 'Le nom de la plante doit contenir au moins un caractère').optional(),
  species: z.string().min(1, 'L’espèce de la plante doit contenir au moins un caractère').optional(),
  status: z.enum(['healthy', 'warning', 'sick', 'dead']).optional(),
  thresholds: thresholdsSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour',
});

const validateCreatePlant = (req, res, next) => {
  try {
    req.validated = createPlantSchema.parse(req.body);
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Erreur de validation des données de la plante';
    next(new AppError(message, 400));
  }
};

const validateUpdatePlant = (req, res, next) => {
  try {
    req.validated = updatePlantSchema.parse(req.body);
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Erreur de validation des données de la mise à jour de plante';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateCreatePlant,
  validateUpdatePlant,
};
