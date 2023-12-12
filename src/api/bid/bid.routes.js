const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  allBidsForServiceRequest,
  updateBid,
  createBid,
} = require('./bid.service');
const { getAgency } = require('../agency/agency.service');

const router = express.Router();

router.post('/create', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  const { serviceRequestId, price, message } = req.body;

  try {
    const agency = await getAgency(userId);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const bid = await createBid({
      serviceRequestId,
      agencyId: agency.id,
      price,
      message,
    });

    res.status(200).json({ bid });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/update', isAuthenticated, async (req, res, next) => {
  const { accepted } = req.body;

  try {
    const bid = await updateBid(req.params.id, { accepted });

    res.status(200).json({ bid });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
