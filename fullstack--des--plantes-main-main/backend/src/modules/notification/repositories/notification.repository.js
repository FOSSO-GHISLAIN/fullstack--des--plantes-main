const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['email', 'push'],
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
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
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

notificationLogSchema.index({ userId: 1, createdAt: -1 });

const NotificationLogModel =
  mongoose.models.NotificationLog ||
  mongoose.model('NotificationLog', notificationLogSchema);

class NotificationRepository {
  async create(data) {
    return NotificationLogModel.create(data);
  }

  async findByUserId(userId, limit = 50) {
    return NotificationLogModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = NotificationRepository;
