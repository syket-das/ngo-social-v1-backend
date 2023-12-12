const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  allServiceRequests,
  createServiceRequest,
  updateServiceRequest,
  serviceRequestDetails,
} = require('./serviceRequest.service');

const router = express.Router();

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const serviceRequests = await allServiceRequests();

    res.status(200).json({ serviceRequests });
  } catch (error) {
    next(error);
  }
});

router.post('/create', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  const {
    categoryId,
    title,
    brief,
    address,
    startDate,
    endDate,
    lowestBudget,
    highestBudget,
    manPowerNeeded,
  } = req.body;

  try {
    const serviceRequest = await createServiceRequest(userId, {
      categoryId,
      title,
      brief,
      address,
      startDate,
      endDate,
      lowestBudget,
      highestBudget,
      manPowerNeeded,
    });

    res.status(200).json({ serviceRequest });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.patch('/:id/update', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;

    const { id } = req.params;
    const { requestApproval } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Id is required' });
    }

    const serviceRequest = await updateServiceRequest(id, { requestApproval });

    res.status(200).json({ serviceRequest });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Id is required' });
    }

    const serviceRequest = await serviceRequestDetails(id);

    res.status(200).json({ serviceRequest });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
