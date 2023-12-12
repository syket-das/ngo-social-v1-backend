const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { db } = require('../../utils/db');
const { getAgency } = require('../agency/agency.service');
const {
  getServices,
  serviceDetails,
  updateService,
  createService,
  allServices,
} = require('./service.service');

const router = express.Router();

router.get('/me', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  try {
    const agency = await getAgency(userId);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const services = await getServices(agency.id);

    res.status(200).json({
      services,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;
  const { title, categoryId, short_description, long_description, documents } =
    req.body;

  try {
    const agency = await getAgency(userId);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const newService = await createService(agency.id, {
      title,
      categoryId,
      short_description,
      long_description,
      documents,
    });

    res.status(200).json({
      service: newService,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/update', async (req, res, next) => {
  const { id } = req.params;
  const { title, category, short_description, long_description, documents } =
    req.body;

  try {
    const service = await serviceDetails(id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updatedService = await updateService(service.id, {
      title,
      category,
      short_description,
      long_description,
      documents,
    });

    res.status(200).json({
      service: updatedService,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const services = await allServices();

    res.status(200).json({ services });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const service = await serviceDetails(id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
