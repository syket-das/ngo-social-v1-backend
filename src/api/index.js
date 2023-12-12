const express = require('express');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const agency = require('./agency/agency.routes');
const service = require('./service/service.routes');
const review = require('./review/review.routes');
const event = require('./event/event.routes');
const category = require('./category/category.routes');
const serviceRequest = require('./serviceRequest/serviceRequest.routes');
const bid = require('./bid/bid.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/agency', agency);
router.use('/service', service);
router.use('/review', review);
router.use('/event', event);
router.use('/category', category);
router.use('/serviceRequest', serviceRequest);
router.use('/bid', bid);

module.exports = router;
