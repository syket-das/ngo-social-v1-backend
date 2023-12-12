const { db } = require('../../utils/db');

const getServices = (agencyId) => {
  return db.service.findMany({
    where: {
      agencyId,
    },
  });
};
const allServices = () => {
  return db.service.findMany({
    include: {
      agency: {
        include: {
          user: true,
        },
      },
      category: true,
    },
  });
};
const serviceDetails = (serviceId) => {
  return db.service.findUnique({
    where: {
      id: serviceId,
    },
    include: {
      agency: true,
      reviews: true,
    },
  });
};
const updateService = (serviceId, body) => {
  return db.service.update({
    where: { id: serviceId },
    data: {
      ...body,
    },
  });
};

const createService = (agencyId, body) => {
  return db.service.create({
    data: {
      agencyId,
      ...body,
    },
  });
};

module.exports = {
  createService,
  getServices,
  allServices,
  serviceDetails,
  updateService,
};
