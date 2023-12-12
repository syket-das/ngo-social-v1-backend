const { db } = require('../../utils/db');

const createServiceRequest = (userId, body) => {
  return db.serviceRequest.create({
    data: {
      userId: userId,
      ...body,
    },
  });
};

const allServiceRequests = () => {
  return db.serviceRequest.findMany({
    include: {
      category: true,
      user: true,
    },
  });
};

const serviceRequestDetails = (serviceRequestId) => {
  return db.serviceRequest.findUnique({
    where: {
      id: serviceRequestId,
    },
    include: {
      bids: {
        include: {
          agency: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
      category: true,
      user: true,
    },
  });
};

const updateServiceRequest = (id, body) => {
  return db.serviceRequest.update({
    where: {
      id,
    },
    data: {
      requestApproval: body.requestApproval || false,
    },
  });
};

module.exports = {
  createServiceRequest,
  allServiceRequests,
  serviceRequestDetails,
  updateServiceRequest,
};
