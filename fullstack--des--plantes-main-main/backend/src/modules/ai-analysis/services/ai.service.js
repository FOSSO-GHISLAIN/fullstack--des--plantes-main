const AiRepository = require('../repositories/ai.repository');
const { publishDiseaseDetected } = require('../events/ai.events');
const AppError = require('../../../shared/utils/app-error');

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const AI_API_KEY = process.env.AI_API_KEY || '';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

class AiService {
  constructor() {
    this.repository = new AiRepository();
  }

  async analyzeSensorTrends(plantId, telemetryData) {
    if (!plantId || !telemetryData) {
      return null;
    }

    try {
      const analysis = await this._callAiProvider('health_prediction', {
        plantId,
        telemetryData,
      });

      const result = {
        diseaseDetected: analysis.diseaseDetected || false,
        diseaseName: analysis.diseaseName || null,
        confidence: analysis.confidence || 0,
        recommendations: analysis.recommendations || [],
        details: analysis.details || {},
      };

      await this.repository.create({
        plantId,
        analysisType: 'health_prediction',
        result,
      });

      if (result.diseaseDetected && result.confidence >= 70) {
        publishDiseaseDetected({
          plantId,
          diseaseName: result.diseaseName,
          confidence: result.confidence,
        });
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'analyse des tendances des capteurs:', error.message);
      return null;
    }
  }

  async diagnoseLeafDisease(plantId, imageSource) {
    if (!plantId || !imageSource) {
      throw new AppError('Données invalides pour le diagnostic', 400);
    }

    try {
      const imageData = await this._prepareImageData(imageSource);

      const analysis = await this._callAiProvider('disease_diagnosis', {
        plantId,
        imageData,
      });

      const result = {
        diseaseDetected: analysis.diseaseDetected || false,
        diseaseName: analysis.diseaseName || null,
        confidence: analysis.confidence || 0,
        recommendations: analysis.recommendations || [],
        details: analysis.details || {},
      };

      const savedAnalysis = await this.repository.create({
        plantId,
        analysisType: 'disease_diagnosis',
        result,
        imageUrl: typeof imageSource === 'string' ? imageSource : null,
      });

      if (result.diseaseDetected && result.confidence >= 70) {
        publishDiseaseDetected({
          plantId,
          diseaseName: result.diseaseName,
          confidence: result.confidence,
        });
      }

      return savedAnalysis;
    } catch (error) {
      console.error('Erreur lors du diagnostic de maladie:', error.message);
      throw error;
    }
  }

  async getAnalysisHistory(plantId, limit = 50) {
    if (!plantId) {
      throw new AppError('Identifiant de plante manquant', 400);
    }

    const normalizedLimit = Math.min(limit || 50, 100);
    return this.repository.findByPlantId(plantId, normalizedLimit);
  }

  async _callAiProvider(analysisType, payload) {
    if (AI_PROVIDER === 'openai') {
      return this._callOpenAi(analysisType, payload);
    } else if (AI_PROVIDER === 'gemini') {
      return this._callGemini(analysisType, payload);
    } else {
      return this._mockAiAnalysis(analysisType, payload);
    }
  }

  async _callOpenAi(analysisType, payload) {
    if (!AI_API_KEY) {
      throw new AppError('Clé API OpenAI non configurée', 500);
    }

    const prompt = this._buildPrompt(analysisType, payload);

    try {
      const response = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en phytopathologie (maladies des plantes). Analyse les données et fournis un diagnostic JSON structuré.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur OpenAI:', error.message);
      throw new AppError('Erreur lors de l\'appel à l\'API IA', 500);
    }
  }

  async _callGemini(analysisType, payload) {
    if (!AI_API_KEY) {
      throw new AppError('Clé API Gemini non configurée', 500);
    }

    const prompt = this._buildPrompt(analysisType, payload);

    try {
      const response = await fetch(
        `${GEMINI_ENDPOINT}?key=${AI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur Gemini:', error.message);
      throw new AppError('Erreur lors de l\'appel à l\'API IA', 500);
    }
  }

  async _mockAiAnalysis(analysisType, payload) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (analysisType === 'health_prediction') {
      const { telemetryData } = payload;
      const isUnhealthy =
        (telemetryData?.temperature > 35 || telemetryData?.temperature < 10) ||
        (telemetryData?.humidity > 90 || telemetryData?.humidity < 20) ||
        (telemetryData?.soilMoisture < 30);

      return {
        diseaseDetected: isUnhealthy,
        diseaseName: isUnhealthy ? 'Stress hydrique ou thermique' : null,
        confidence: isUnhealthy ? 75 : 0,
        recommendations: isUnhealthy
          ? ['Réguler la température', 'Ajuster l\'humidité', 'Vérifier l\'humidité du sol']
          : ['État normal, continuer le suivi'],
        details: {
          stressType: isUnhealthy ? 'Multiple' : 'None',
          severity: isUnhealthy ? 'Modéré' : 'Aucun',
        },
      };
    } else if (analysisType === 'disease_diagnosis') {
      return {
        diseaseDetected: false,
        diseaseName: null,
        confidence: 0,
        recommendations: ['Aucune maladie détectée. Continuer le suivi.'],
        details: {
          leafCondition: 'Healthy',
          colorAnalysis: 'Normal green coloration',
        },
      };
    }

    return {
      diseaseDetected: false,
      diseaseName: null,
      confidence: 0,
      recommendations: [],
      details: {},
    };
  }

  async _prepareImageData(imageSource) {
    if (typeof imageSource === 'string') {
      return { type: 'url', url: imageSource };
    }

    if (imageSource.buffer) {
      const base64 = imageSource.buffer.toString('base64');
      return {
        type: 'base64',
        mimeType: imageSource.mimetype || 'image/jpeg',
        data: base64,
      };
    }

    throw new AppError('Format d\'image invalide', 400);
  }

  _buildPrompt(analysisType, payload) {
    if (analysisType === 'health_prediction') {
      const { telemetryData } = payload;
      return `Analyse ces données de capteurs de plante et fournis un diagnostic JSON:
Température: ${telemetryData?.temperature}°C
Humidité air: ${telemetryData?.humidity}%
Humidité sol: ${telemetryData?.soilMoisture}%
Luminosité: ${telemetryData?.light}

Réponds UNIQUEMENT avec un JSON valide contenant: diseaseDetected (boolean), diseaseName (string|null), confidence (0-100), recommendations (array), details (object).`;
    } else if (analysisType === 'disease_diagnosis') {
      return `Analyse cette image de feuille de plante pour détecter des maladies.
Fournis un diagnostic JSON contenant: diseaseDetected (boolean), diseaseName (string|null), confidence (0-100), recommendations (array), details (object).
Sois concis et précis.`;
    }

    return 'Analyse la plante et fournis un diagnostic.';
  }
}

module.exports = AiService;
