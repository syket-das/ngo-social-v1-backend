const express = require('express');
const bcrypt = require('bcrypt');

const { findUserByEmail, createUser } = require('../users/users.services');
const generateToken = require('../../utils/generateToken');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Email already in use.');
    }

    const user = await createUser({ fullName, email, password });

    res.json({
      token: generateToken(user.id),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    res.json({
      token: generateToken(existingUser.id),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
