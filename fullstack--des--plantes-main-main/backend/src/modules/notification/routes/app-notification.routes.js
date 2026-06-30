const express = require('express');
const router = express.Router();
const {
  listNotifications,
  createNotification,
  markNotificationRead,
} = require('../controllers/app-notification.controller');
const { getNotificationHistory } = require('../controllers/notification.controller');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(authenticate);

router.get('/', asyncHandler(listNotifications));
router.post('/', asyncHandler(createNotification));
router.patch('/:id/read', asyncHandler(markNotificationRead));
router.get('/history', asyncHandler(getNotificationHistory));

module.exports = router;
