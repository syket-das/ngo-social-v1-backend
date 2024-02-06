const { db } = require('../../utils/db');

function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUser(user) {
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

const updateUser = (id, body) => {
  return db.user.update({
    where: { id },
    data: {
      ...body,
    },
  });
};

const allUsers = () => {
  return db.user.findMany({});
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  allUsers,
};
