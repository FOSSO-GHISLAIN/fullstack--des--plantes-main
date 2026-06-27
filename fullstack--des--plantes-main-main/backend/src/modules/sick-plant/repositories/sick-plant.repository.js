const mongoose = require('mongoose');

const sickPlantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    plantName: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      trim: true,
      default: '',
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['légère', 'modérée', 'grave'],
      required: true,
      default: 'modérée',
    },
    diagnosisDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    treatment: {
      type: String,
      trim: true,
      default: '',
    },
    treatmentStatus: {
      type: String,
      enum: ['non_traité', 'en_cours', 'guéri'],
      default: 'non_traité',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SickPlantModel =
  mongoose.models.SickPlant || mongoose.model('SickPlant', sickPlantSchema);

class SickPlantRepository {
  async create(data) {
    return SickPlantModel.create(data);
  }

  async findByUserId(userId) {
    return SickPlantModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return SickPlantModel.findById(id).lean();
  }

  async findByIdAndUserId(id, userId) {
    return SickPlantModel.findOne({ _id: id, userId }).lean();
  }

  async update(id, data) {
    return SickPlantModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      lean: true,
    });
  }

  async delete(id) {
    return SickPlantModel.findByIdAndDelete(id).lean();
  }

  async countByUserId(userId) {
    return SickPlantModel.countDocuments({ userId });
  }

  async findBySeverity(userId, severity) {
    return SickPlantModel.find({ userId, severity }).sort({ createdAt: -1 }).lean();
  }
}

module.exports = SickPlantRepository;
