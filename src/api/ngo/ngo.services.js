const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

function findNgoByEmail(email) {
  return db.ngo.findUnique({
    where: {
      email,
    },
  });
}

function createNgo(ngo) {
  ngo.password = bcrypt.hashSync(ngo.password, 12);
  return db.ngo.create({
    data: ngo,
  });
}

const allNGOs = () => {
  return db.ngo.findMany();
};

module.exports = {
  findNgoByEmail,
  createNgo,
  allNGOs,
};
