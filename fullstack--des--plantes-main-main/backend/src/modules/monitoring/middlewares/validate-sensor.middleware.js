const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

const sensorSchema = z.object({
  plantId: z.string().min(1, "L'identifiant de la plante est requis"),
  temperature: z.coerce
    .number({ invalid_type_error: 'La température doit être un nombre' })
    .min(-40, 'La température doit être supérieure à -40°C')
    .max(60, 'La température doit être inférieure à 60°C'),
  humidity: z.coerce
    .number({ invalid_type_error: "L'humidité de l'air doit être un nombre" })
    .min(0, "L'humidité doit être entre 0 et 100 %")
    .max(100, "L'humidité doit être entre 0 et 100 %"),
  soilMoisture: z.coerce
    .number({ invalid_type_error: "L'humidité du sol doit être un nombre" })
    .min(0, "L'humidité du sol doit être entre 0 et 100 %")
    .max(100, "L'humidité du sol doit être entre 0 et 100 %"),
  light: z.coerce
    .number({ invalid_type_error: 'La luminosité doit être un nombre' })
    .min(0, 'La luminosité doit être supérieure ou égale à 0'),
});

const validateSensorData = (req, res, next) => {
  try {
    req.validated = sensorSchema.parse(req.body);
    next();
  } catch (error) {
    const message = error.errors?.[0]?.message || 'Erreur de validation des données de capteur';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateSensorData,
};
