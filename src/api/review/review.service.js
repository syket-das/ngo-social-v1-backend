const { db } = require('../../utils/db');

const createReview = (userId, serviceId, body) => {
  return db.review.create({
    data: {
      authorId: userId,
      serviceId,
      ...body,
    },
  });
};

module.exports = {
  createReview,
};
