const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  getAgency,
  createAgency,
  updateAgency,
  allAgencies,
  getAgencyById,
} = require('./agency.service');

const router = express.Router();

router.get('/getProfile', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  try {
    const agency = await getAgency(userId);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.status(200).json({
      agency,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  const { name, description } = req.body;

  try {
    const agency = await getAgency(userId);

    if (agency) {
      return res
        .status(405)
        .json({ message: 'User can not create multiple agencies' });
    }

    const newAgency = await createAgency(userId, { name, description });

    res.status(201).json({
      agency: newAgency,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/update', isAuthenticated, async (req, res, next) => {
  const { id: userId } = req.payload;

  const { name, description, documents } = req.body;

  try {
    const agency = await updateAgency(userId, { name, description, documents });
    res.status(200).json({
      agency,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const agencies = await allAgencies();

    res.status(200).json({
      agencies,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:agencyId', async (req, res, next) => {
  const { agencyId } = req.params;

  try {
    const agency = await getAgencyById(agencyId);

    res.status(200).json({
      agency,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
