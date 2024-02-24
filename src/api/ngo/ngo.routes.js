const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findNgoById, updateNgo } = require('./ngo.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { id: ngoId } = req.payload;
    const ngo = await findNgoById(ngoId);

    if (!ngo) {
      next(new Error('Ngo not found'));
    }
    delete ngo.password;
    res.json(ngo);
  } catch (err) {
    next(err);
  }
});

router.put('/profile/update', isAuthenticated, async (req, res, next) => {
  try {
    const { id: ngoId } = req.payload;
    const ngo = await findNgoById(ngoId);

    if (!ngo) {
      next(new Error('Ngo not found'));
    }

    const updatedNgo = await updateNgo(ngoId, req.body);
    delete updatedNgo.password;
    res.json(updatedNgo);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
