const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Plant',
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    soilMoisture: {
      type: Number,
      required: true,
    },
    light: {
      type: Number,
      required: true,
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

sensorDataSchema.index({ plantId: 1, createdAt: -1 });

const SensorDataModel = mongoose.models.SensorData || mongoose.model('SensorData', sensorDataSchema);

class MonitoringRepository {
  async create(data) {
    return SensorDataModel.create(data);
  }

  async findLatestByPlantId(plantId) {
    return SensorDataModel.findOne({ plantId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findHistoryByPlantId(plantId, limit = 100) {
    return SensorDataModel.find({ plantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async deleteByPlantId(plantId) {
    return SensorDataModel.deleteMany({ plantId });
  }
}

module.exports = MonitoringRepository;
