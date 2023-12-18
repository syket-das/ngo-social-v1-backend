const { db } = require('../../utils/db');

function findNgoByEmail(email) {
  return db.ngo.findUnique({
    where: {
      email,
    },
  });
}

function findNgoById(id) {
  return db.ngo.findUnique({
    where: {
      id,
    },
  });
}

function createNgo(ngo) {
  return db.ngo.create({
    data: ngo,
  });
}

const updateNgo = (id, body) => {
  return db.ngo.update({
    where: { id },
    data: {
      ...body,
    },
  });
};

const allNGOs = () => {
  return db.ngo.findMany();
};

module.exports = {
  findNgoByEmail,
  findNgoById,
  createNgo,
  updateNgo,
  allNGOs,
};
