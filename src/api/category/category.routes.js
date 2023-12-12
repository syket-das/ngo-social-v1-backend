const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { allCategories, createCategory } = require('./category.service');

const router = express.Router();

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const categories = await allCategories();

    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post('/create', isAuthenticated, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const category = await createCategory(req.body);

    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
