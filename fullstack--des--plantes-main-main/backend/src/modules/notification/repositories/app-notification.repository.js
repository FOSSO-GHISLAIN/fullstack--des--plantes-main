const mongoose = require('mongoose');

const appNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['watering', 'fertilizing', 'treatment', 'harvest', 'flowering', 'disease', 'growth', 'info'],
      default: 'info',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    plantId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appNotificationSchema.index({ userId: 1, createdAt: -1 });

const AppNotificationModel =
  mongoose.models.AppNotification ||
  mongoose.model('AppNotification', appNotificationSchema);

class AppNotificationRepository {
  async create(data) {
    return AppNotificationModel.create(data);
  }

  async findByUserId(userId, limit = 50) {
    return AppNotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findById(id) {
    return AppNotificationModel.findById(id).lean();
  }

  async markAsRead(id, userId) {
    return AppNotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true, lean: true }
    );
  }

  async deleteAllForUser(userId) {
    return AppNotificationModel.deleteMany({ userId });
  }
}

module.exports = AppNotificationRepository;
