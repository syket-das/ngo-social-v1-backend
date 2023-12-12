const { db } = require('../../utils/db');

const allBidsForServiceRequest = async (serviceRequestId) => {
  return db.bid.findMany({
    where: {
      serviceRequestId,
    },
    include: {
      agency: true,
    },
  });
};

const createBid = (body) => {
  return db.bid.create({
    data: {
      ...body,
    },
  });
};

const updateBid = (bidId, body) => {
  return db.bid.update({
    where: { id: bidId },
    data: {
      accepted: body.accepted ? body.accepted : false,
    },
  });
};

module.exports = {
  createBid,
  allBidsForServiceRequest,
  updateBid,
};
