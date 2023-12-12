const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { createEvent, getEventById } = require('./event.service');

const router = express.Router();

router.post('/create', isAuthenticated, async (req, res, next) => {
  const {
    title,
    description,
    startDate,
    endDate,
    address,
    thumbnail,
    documents,
  } = req.body;

  const { id: userId } = req.payload;

  try {
    const event = await createEvent(userId, {
      title,
      description,
      startDate,
      endDate,
      address,
      thumbnail,
      documents,
    });

    res.status(201).json({
      event,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  const { id: userId } = req.payload;

  try {
    const event = await getEventById(id);

    res.status(200).json({
      event,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
