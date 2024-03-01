const { db } = require('../../utils/db');

function createNotification(notification) {
  return db.notification.create({
    data: notification,
  });
}

function findNotificationById(id) {
  return db.notification.findUnique({
    where: {
      id,
    },
  });
}

function updateNotification(id, body) {
  return db.notification.update({
    where: { id },
    data: {
      ...body,
    },
  });
}

function deleteNotification(id) {
  return db.notification.delete({
    where: { id },
  });
}

module.exports = {
  createNotification,
  findNotificationById,
  updateNotification,
  deleteNotification,
};
