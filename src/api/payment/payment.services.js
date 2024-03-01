const { db } = require('../../utils/db');

function createTransaction(data) {
  return db.transaction.create({
    data: data,
  });
}

const findTransaction = (id) => {
  return db.transaction.findUnique({
    where: {
      id: id,
    },
  });
};

const updateTransaction = (id, data) => {
  return db.transaction.update({
    where: {
      id: id,
    },
    data: data,
  });
};

module.exports = {
  createTransaction,
};
