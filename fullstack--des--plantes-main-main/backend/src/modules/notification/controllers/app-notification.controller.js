const AppNotificationService = require('../services/app-notification.service');
const AppError = require('../../../shared/utils/app-error');
const { toId, toIdList } = require('../../../shared/utils/serialize');

const appNotificationService = new AppNotificationService();

const listNotifications = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const notifications = await appNotificationService.listNotifications(userId);

  res.status(200).json({
    status: 'success',
    data: toIdList(notifications),
  });
};

const createNotification = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const notification = await appNotificationService.createNotification(userId, req.body);

  res.status(201).json({
    status: 'success',
    data: toId(notification),
  });
};

const markNotificationRead = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  const notification = await appNotificationService.markAsRead(userId, req.params.id);

  res.status(200).json({
    status: 'success',
    data: toId(notification),
  });
};

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead,
};
