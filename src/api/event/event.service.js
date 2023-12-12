const { db } = require('../../utils/db');

const createEvent = (creatorId, body) => {
  return db.event.create({
    data: {
      ...body,
      creatorId: creatorId,
    },
  });
};

const getEventById = (id) => {
  return db.event.findUnique({
    where: {
      id,
    },
    include: {
      creator: true,
      subscriptions: true,
    },
  });
};

module.exports = {
  createEvent,
  getEventById,
};
