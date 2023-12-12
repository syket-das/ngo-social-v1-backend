const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { getAgency } = require('../agency/agency.service');
const { serviceDetails } = require('../service/service.service');
const { createReview } = require('./review.service');

const router = express.Router();

router.post('/create/:serviceId', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;
  const { serviceId } = req.params;

  const { rating, comment } = req.body;

  try {
    const agency = await getAgency(userId);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const service = await serviceDetails(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const review = await createReview(userId, serviceId, {
      rating,
      comment,
    });

    res.status(200).json({
      review,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/update', isAuthenticated, async (req, res) => {});

router.delete('/:id/delete', isAuthenticated, async (req, res) => {});

module.exports = router;
