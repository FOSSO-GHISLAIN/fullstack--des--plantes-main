const express = require('express');
const router = express.Router();
const { getNotificationHistory } = require('../controllers/notification.controller');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/history', asyncHandler(getNotificationHistory));

module.exports = router;
