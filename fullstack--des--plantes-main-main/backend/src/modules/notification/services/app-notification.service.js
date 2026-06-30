const AppNotificationRepository = require('../repositories/app-notification.repository');
const AppError = require('../../../shared/utils/app-error');

class AppNotificationService {
  constructor() {
    this.repository = new AppNotificationRepository();
  }

  async listNotifications(userId, limit = 50) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    return this.repository.findByUserId(userId, limit);
  }

  async createNotification(userId, payload) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    return this.repository.create({
      userId,
      type: payload.type || 'info',
      title: payload.title,
      message: payload.message,
      plantId: payload.plantId || null,
      read: false,
    });
  }

  async markAsRead(userId, notificationId) {
    if (!userId) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    const updated = await this.repository.markAsRead(notificationId, userId);
    if (!updated) {
      throw new AppError('Notification introuvable', 404);
    }

    return updated;
  }
}

module.exports = AppNotificationService;
