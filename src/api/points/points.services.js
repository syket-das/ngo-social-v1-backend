const { db } = require('../../utils/db');

const addUserPoints = (userId, body) => {
  return db.userPoints.create({
    data: {
      userId,
      ...body,
    },
  });
};

const addNgosPoints = (ngoId, body) => {
  return db.ngoPoints.create({
    data: {
      ngoId,
      ...body,
    },
  });
};

module.exports = {
  addUserPoints,
  addNgosPoints,
};
