const { db } = require('../../utils/db');

const createFundRaising = (data) => {
  return db.fundRaising.create({
    data: data,
  });
};

const getFundRaisings = () => {
  return db.fundRaising.findMany({
    include: {
      ngo: true,
      user: true,
      transactions: true,
    },
  });
};

const getFundRaisingById = (id) => {
  return db.fundRaising.findUnique({
    where: {
      id,
    },
    include: {
      ngo: true,
      user: true,
      transactions: true,
    },
  });
};

const updateFundRaisingById = (id, fundRaising) => {
  return db.fundRaising.update({
    data: fundRaising,
    where: {
      id,
    },
  });
};

const donateToFundRaising = (fundRaisingId, data) => {
  return db.fundRaising.update({
    data: {
      transactions: {
        create: {
          data,
        },
      },
    },

    where: {
      id: fundRaisingId,
    },
  });
};

const checkIfNgoOwnsFundRaising = (fundRaisingId, ngoId) => {
  return db.fundRaising.findFirst({
    where: {
      id: fundRaisingId,
      ownNgo: {
        id: ngoId,
      },
    },
  });
};

const checkIfUserOwnsFundRaising = (fundRaisingId, userId) => {
  return db.fundRaising.findFirst({
    where: {
      id: fundRaisingId,
      ownUser: {
        id: userId,
      },
    },
  });
};

module.exports = {
  createFundRaising,
  getFundRaisings,
  getFundRaisingById,
  updateFundRaisingById,
  donateToFundRaising,
  checkIfNgoOwnsFundRaising,
  checkIfUserOwnsFundRaising,
};
