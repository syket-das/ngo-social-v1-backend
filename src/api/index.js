const express = require('express');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const ngo = require('./ngo/ngo.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/ngo', ngo);

module.exports = router;
