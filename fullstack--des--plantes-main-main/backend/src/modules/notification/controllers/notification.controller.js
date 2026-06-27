const NotificationService = require('../services/notification.service');
const AppError = require('../../../shared/utils/app-error');

const notificationService = new NotificationService();

const getNotificationHistory = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Utilisateur non authentifié', 401);
  }

  let limit = req.query.limit ? Number(req.query.limit) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 50;
  }

  const history = await notificationService.getNotificationHistory(userId, limit);

  res.status(200).json({
    status: 'success',
    data: history,
  });
};

module.exports = {
  getNotificationHistory,
};
