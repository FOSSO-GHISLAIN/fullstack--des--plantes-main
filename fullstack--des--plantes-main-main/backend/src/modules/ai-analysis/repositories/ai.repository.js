const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema(
  {
    diseaseDetected: { type: Boolean, default: false },
    diseaseName: { type: String, default: null },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    recommendations: [{ type: String }],
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Plant',
    },
    analysisType: {
      type: String,
      enum: ['health_prediction', 'disease_diagnosis'],
      required: true,
    },
    result: {
      type: analysisResultSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

aiAnalysisSchema.index({ plantId: 1, createdAt: -1 });

const AiAnalysisModel = mongoose.models.AiAnalysis || mongoose.model('AiAnalysis', aiAnalysisSchema);

class AiRepository {
  async create(data) {
    return AiAnalysisModel.create(data);
  }

  async findByPlantId(plantId, limit = 50) {
    return AiAnalysisModel.find({ plantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = AiRepository;
