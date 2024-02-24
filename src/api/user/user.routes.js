const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  findUserById,
  updateUser,
  allUsers,
  allMaintainers,
} = require('./user.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;
    const user = await findUserById(userId);

    if (!user) {
      next(new Error('User not found'));
    }
    delete user.password;
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/profile/update', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;
    const { fullName, bio, profession, interests, phone, address } = req.body;

    const user = await updateUser(userId, {
      fullName,
      phone,
      address,

      bio: bio,
      profession: profession,
      interests: interests,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const users = await allUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
