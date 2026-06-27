const AiService = require('../services/ai.service');
const AppError = require('../../../shared/utils/app-error');

const aiService = new AiService();

const diagnoseLeafImage = async (req, res, next) => {
  const { plantId } = req.params;

  if (!plantId) {
    throw new AppError("L'identifiant de la plante est requis", 400);
  }

  if (!req.file) {
    throw new AppError('Aucune image fournie', 400);
  }

  const analysis = await aiService.diagnoseLeafDisease(plantId, req.file);

  res.status(201).json({
    status: 'success',
    message: 'Diagnostic de maladie effectué avec succès',
    data: analysis,
  });
};

const getAnalysisHistory = async (req, res, next) => {
  const { plantId } = req.params;

  if (!plantId) {
    throw new AppError("L'identifiant de la plante est requis", 400);
  }

  let limit = req.query.limit ? Number(req.query.limit) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 50;
  }

  const history = await aiService.getAnalysisHistory(plantId, limit);

  res.status(200).json({
    status: 'success',
    data: history,
  });
};

module.exports = {
  diagnoseLeafImage,
  getAnalysisHistory,
};
