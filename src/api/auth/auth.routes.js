const express = require('express');
const bcrypt = require('bcrypt');

const {
  findUserByEmail,
  createUser,
  updateUser,
} = require('../users/users.services');
const { findNgoByEmail, createNgo, updateNgo } = require('../ngo/ngo.services');
const generateToken = require('../../utils/generateToken');
const { sendEmail } = require('../../utils/sendEmail');

const router = express.Router();

router.post('/register/user', async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    let otp = Math.floor(100000 + Math.random() * 900000);
    if (!email || !fullName) {
      res.status(400);
      throw new Error('You must provide a name and email.');
    }

    const existingUser = await findUserByEmail(email);
    const existingNgo = await findNgoByEmail(email);

    if (existingUser || existingNgo) {
      res.status(400);
      throw new Error('Email already in use by another user or NGO.');
    }

    const user = await createUser({
      fullName,
      email,
      otp,
    });

    await sendEmail(
      email,
      'Welcome to CypIndia',
      `Hi ${fullName},\n\nWelcome to CypIndia! We're excited to have you on board.\nYour Opt is ${otp}  \n\nBest Wishes,\nCypIndia Team `
    );

    res.json({
      success: true,
      message: 'Please check your email for verification.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify/user', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400);
      throw new Error('You must provide an email and a otp.');
    }
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }
    if (Number(existingUser.otp) !== Number(otp)) {
      res.status(403);
      throw new Error('Invalid otp.');
    }

    const updatedUser = await updateUser(existingUser.id, {
      otp: null,
      verified: true,
      verifiedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'User verified successfully.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-otp/user', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('You must provide an email.');
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    let otp = Math.floor(100000 + Math.random() * 900000);

    const updatedUser = await updateUser(existingUser.id, {
      otp,
    });

    await sendEmail(
      email,
      'Welcome to CypIndia',
      `Hi ${existingUser.fullName},\n\nWelcome to CypIndia! We're excited to have you on board.\nYour Opt is ${otp}  \n\nBest Wishes,\nCypIndia Team `
    );

    res.json({
      success: true,
      message: 'Please check your email for verification.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/set-password/user', async (req, res, next) => {
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

    if (existingUser.password || !existingUser.verified) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await updateUser(existingUser.id, {
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: 'Password updated successfully.',
      token: generateToken(updatedUser.id),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login/user', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser || !existingUser.verified || !existingUser.password) {
      res.status(401);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    res.json({
      success: true,
      token: generateToken(existingUser.id),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register/ngo', async (req, res, next) => {
  try {
    const { name, type, email, phone, address } = req.body;
    if (!email || !type || !name || !phone) {
      res.status(400);
      throw new Error(
        'You must provide an email and a name and a type and a phone.'
      );
    }

    const existingNgo = await findNgoByEmail(email);
    const existingUser = await findUserByEmail(email);

    if (existingNgo || existingUser) {
      res.status(400);
      throw new Error('Email already in use by another user or NGO.');
    }

    let otp = Math.floor(100000 + Math.random() * 900000);

    const ngo = await createNgo({
      name,
      type,
      email,
      phone,
      address,
      otp,
    });

    await sendEmail(
      email,
      'Welcome to CypIndia',
      `Hi ${name},\n\nWelcome to CypIndia! We're excited to have you on board.\nYour Opt is ${otp}  \n\nBest Wishes,\nCypIndia Team `
    );

    res.json({
      success: true,
      message: 'Please check your email for verification.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify/ngo', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400);
      throw new Error('You must provide an email and a otp.');
    }

    const existingNgo = await findNgoByEmail(email);

    if (!existingNgo) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    if (Number(existingNgo.otp) !== Number(otp)) {
      res.status(403);
      throw new Error('Invalid otp.');
    }

    const updatedNgo = await updateNgo(existingNgo.id, {
      otp: null,
      verified: true,
      verifiedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'NGO verified successfully.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-otp/ngo', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('You must provide an email.');
    }

    const existingNgo = await findNgoByEmail(email);

    if (!existingNgo) {
      res.status(403);
      throw new Error('Invalid login credentials. ');
    }

    let otp = Math.floor(100000 + Math.random() * 900000);

    const updatedNgo = await updateNgo(existingNgo.id, {
      otp,
    });

    await sendEmail(
      email,
      'Welcome to CypIndia',
      `Hi ${existingNgo.name},\n\nWelcome to CypIndia! We're excited to have you on board.\nYour Opt is ${otp}  \n\nBest Wishes,\nCypIndia Team `
    );

    res.json({
      success: true,
      message: 'Please check your email for verification.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/set-password/ngo', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingNgo = await findNgoByEmail(email);

    if (!existingNgo) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    if (existingNgo.password || !existingNgo.verified) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedNgo = await updateNgo(existingNgo.id, {
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: 'Password updated successfully.',
      token: generateToken(updatedNgo.id),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login/ngo', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingNgo = await findNgoByEmail(email);

    if (!existingNgo || !existingNgo.verified || !existingNgo.password) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingNgo.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    res.json({
      success: true,
      token: generateToken(existingNgo.id),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
