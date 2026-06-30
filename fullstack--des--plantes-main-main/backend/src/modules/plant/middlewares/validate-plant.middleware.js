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
  species: z.string().optional(),
  type: z.string().optional(),
  plantedDate: z.string().optional(),
  soilType: z.string().optional(),
  waterNeeds: z.string().optional(),
  height: z.coerce.number().nonnegative().optional().default(0),
  leafCount: z.coerce.number().nonnegative().optional().default(0),
  temperature: z.coerce.number().optional().default(22),
  humidity: z.coerce.number().optional().default(60),
  status: z.enum(['healthy', 'warning', 'sick', 'dead']).optional().default('healthy'),
  thresholds: thresholdsSchema.optional(),
});

const updatePlantSchema = z
  .object({
    name: z.string().min(1, 'Le nom de la plante doit contenir au moins un caractère').optional(),
    species: z.string().min(1, 'L’espèce de la plante doit contenir au moins un caractère').optional(),
    type: z.string().optional(),
    plantedDate: z.string().optional(),
    soilType: z.string().optional(),
    waterNeeds: z.string().optional(),
    height: z.coerce.number().nonnegative().optional(),
    leafCount: z.coerce.number().nonnegative().optional(),
    temperature: z.coerce.number().optional(),
    humidity: z.coerce.number().optional(),
    status: z.enum(['healthy', 'warning', 'sick', 'dead']).optional(),
    thresholds: thresholdsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

const growthEntrySchema = z.object({
  date: z.string().optional(),
  height: z.coerce.number().nonnegative('La hauteur doit être positive'),
  leafCount: z.coerce.number().nonnegative('Le nombre de feuilles doit être positif'),
  temperature: z.coerce.number(),
  humidity: z.coerce.number(),
});

const validateCreatePlant = (req, res, next) => {
  try {
    console.log('[validateCreatePlant] body recu:', JSON.stringify(req.body));
    req.validated = createPlantSchema.parse(req.body);
    next();
  } catch (error) {
    console.error('[VALIDATION ERROR]', JSON.stringify(error.errors));
    const message = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Erreur de validation';
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

const validateGrowthEntry = (req, res, next) => {
  try {
    req.validated = growthEntrySchema.parse(req.body);
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Erreur de validation de la mesure de croissance';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateCreatePlant,
  validateUpdatePlant,
  validateGrowthEntry,
};
