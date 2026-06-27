const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema(
  {
    minSoilMoisture: { type: Number, required: false },
    maxTemperature: { type: Number, required: false },
    maxHumidity: { type: Number, required: false },
    minLight: { type: Number, required: false },
  },
  { _id: false }
);

const plantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'sick', 'dead'],
      default: 'healthy',
      required: true,
    },
    thresholds: {
      type: thresholdSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PlantModel = mongoose.models.Plant || mongoose.model('Plant', plantSchema);

class PlantRepository {
  async create(data) {
    return PlantModel.create(data);
  }

  async findByUserId(userId) {
    return PlantModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return PlantModel.findById(id).lean();
  }

  async updateStatus(plantId, status) {
    return PlantModel.findByIdAndUpdate(
      plantId,
      { status },
      { new: true, runValidators: true, lean: true }
    );
  }

  async delete(plantId) {
    return PlantModel.findByIdAndDelete(plantId).lean();
  }
}

module.exports = PlantRepository;
