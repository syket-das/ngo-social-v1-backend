const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  createNotification,
  updateNotification,
  findNotificationById,
} = require('./notification.services');

const router = express.Router();

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  const { message, link } = req.body;

  const { id: userId } = req.payload;

  try {
    if (!message) {
      return res.status(400).json({
        message: 'Message and link are required',
      });
    }

    const notification = await createNotification({
      message,
      link,
      userId,
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  const { message, link } = req.body;

  const { id: ngoId } = req.payload;

  try {
    if (!message) {
      return res.status(400).json({
        message: 'Message and link are required',
      });
    }

    const notification = await createNotification({
      message,
      link,
      ngoId,
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/mark-read/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  try {
    const notificationExists = await findNotificationById(id);

    if (!notificationExists) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    const notification = await updateNotification(id, {
      read: true,
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
