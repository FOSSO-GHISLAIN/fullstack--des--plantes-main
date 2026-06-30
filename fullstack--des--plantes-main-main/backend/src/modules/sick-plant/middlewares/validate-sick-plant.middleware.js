const { z } = require('zod');
const AppError = require('../../../shared/utils/app-error');

// ─── Schéma de création ─────────────────────────────────────────────────────
const createSickPlantSchema = z.object({
  plantName: z
    .string()
    .min(1, 'Le nom de la plante est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  species: z
    .string()
    .max(100, "L'espèce ne peut pas dépasser 100 caractères")
    .optional()
    .default(''),

  symptoms: z
    .string()
    .min(5, 'Veuillez décrire les symptômes (minimum 5 caractères)')
    .max(1000, 'La description des symptômes ne peut pas dépasser 1000 caractères'),

  severity: z
    .enum(['légère', 'modérée', 'grave'], {
      errorMap: () => ({ message: 'La gravité doit être : légère, modérée ou grave' }),
    })
    .default('modérée'),

  diagnosisDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La date de diagnostic doit être une date valide',
    })
    .optional(),

  treatment: z
    .string()
    .max(1000, 'Le traitement ne peut pas dépasser 1000 caractères')
    .optional()
    .default(''),

  treatmentStatus: z
    .enum(['non_traité', 'en_cours', 'guéri'], {
      errorMap: () => ({
        message: 'Le statut doit être : non_traité, en_cours ou guéri',
      }),
    })
    .optional()
    .default('non_traité'),

  location: z
    .string()
    .max(200, 'La localisation ne peut pas dépasser 200 caractères')
    .optional()
    .default(''),

  notes: z
    .string()
    .max(2000, 'Les notes ne peuvent pas dépasser 2000 caractères')
    .optional()
    .default(''),

  photos: z
    .array(
      z.string().refine(
        (val) => val.startsWith('data:image/jpeg') || val.startsWith('data:image/png'),
        { message: 'Seules les images JPG et PNG sont acceptées' }
      )
    )
    .max(2, 'Maximum 2 photos autorisées')
    .optional()
    .default([]),
});

// ─── Schéma de mise à jour ───────────────────────────────────────────────────
const updateSickPlantSchema = z
  .object({
    plantName: z
      .string()
      .min(1, 'Le nom de la plante doit contenir au moins un caractère')
      .max(100)
      .optional(),

    species: z.string().max(100).optional(),

    symptoms: z
      .string()
      .min(5, 'Veuillez décrire les symptômes (minimum 5 caractères)')
      .max(1000)
      .optional(),

    severity: z.enum(['légère', 'modérée', 'grave']).optional(),

    diagnosisDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'La date de diagnostic doit être une date valide',
      })
      .optional(),

    treatment: z.string().max(1000).optional(),

    treatmentStatus: z.enum(['non_traité', 'en_cours', 'guéri']).optional(),

    location: z.string().max(200).optional(),

    notes: z.string().max(2000).optional(),

    photos: z
      .array(
        z.string().refine(
          (val) => val.startsWith('data:image/jpeg') || val.startsWith('data:image/png'),
          { message: 'Seules les images JPG et PNG sont acceptées' }
        )
      )
      .max(2, 'Maximum 2 photos autorisées')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// ─── Middlewares ─────────────────────────────────────────────────────────────
const validateCreateSickPlant = (req, res, next) => {
  try {
    req.validated = createSickPlantSchema.parse(req.body);
    next();
  } catch (error) {
    const message =
      error.errors?.[0]?.message ||
      'Erreur de validation des données de la plante malade';
    next(new AppError(message, 400));
  }
};

const validateUpdateSickPlant = (req, res, next) => {
  try {
    req.validated = updateSickPlantSchema.parse(req.body);
    next();
  } catch (error) {
    const message =
      error.errors?.[0]?.message ||
      'Erreur de validation des données de mise à jour';
    next(new AppError(message, 400));
  }
};

module.exports = {
  validateCreateSickPlant,
  validateUpdateSickPlant,
};
