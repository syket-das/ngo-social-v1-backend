const express = require('express');

const { Role } = require('@prisma/client');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../user/user.services');
const { findNgoById } = require('../ngo/ngo.services');

const {
  getMediaFromS3,
  addMediaToS3,
  deleteMediaFromS3,
} = require('../../utils/s3');
const { v4: uuidv4 } = require('uuid');
const {
  createFundRaising,
  getFundRaisings,
  getFundRaisingById,
} = require('./fundRaising.services');

const router = express.Router();

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  const isoDate = new Date().toISOString();
  const mediaAvailable = req.files && req.files.length > 0;
  let mKeys = [];

  try {
    const { id: userId } = req.payload;

    const { title, description, startDate, endDate, address, amount, tags } =
      req.body;

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !mediaAvailable ||
      !amount
    ) {
      throw new Error('All fields are required');
    }

    const userExist = await findUserById(userId);

    if (!userExist || userExist.role !== Role.USER) {
      throw new Error('User not found');
    }

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `fundRaising/user/${userId}/${mediaName}`;

      mKeys.push(key);

      // Upload media to S3
      const response = await addMediaToS3({
        body: media.buffer,
        key: key,
        mimetype: media.mimetype,
      });

      return {
        key,
        url: getMediaFromS3(key),
        type: media.mimetype,
      };
    });

    // Wait for all uploads to complete
    const mediaFiles = await Promise.all(uploadPromises);
    let parsedAddress = JSON.parse(address);

    if (parsedAddress.lat == '' || parsedAddress.lng == '') {
      parsedAddress.lat = undefined;
      parsedAddress.lng = undefined;
    }

    const createdFundRaising = await createFundRaising({
      userId: userId,
      title,
      description,
      startDate: JSON.parse(startDate),
      endDate: JSON.parse(endDate),
      address: parsedAddress,
      amount: JSON.parse(amount),
      tags: JSON.parse(tags),
      media: mediaFiles,
    });

    return res.json({
      success: true,
      data: createdFundRaising,
    });
  } catch (error) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    next(error);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  const isoDate = new Date().toISOString();
  const mediaAvailable = req.files && req.files.length > 0;
  let mKeys = [];

  try {
    const { id: ngoId } = req.payload;

    const { title, description, startDate, endDate, address, amount, tags } =
      req.body;

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !mediaAvailable ||
      !amount
    ) {
      throw new Error('All fields are required');
    }

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist.role !== Role.NGO) {
      throw new Error('NGO not found');
    }

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `fundRaising/ngo/${ngoId}/${mediaName}`;

      mKeys.push(key);

      // Upload media to S3
      const response = await addMediaToS3({
        body: media.buffer,
        key: key,
        mimetype: media.mimetype,
      });

      return {
        key,
        url: getMediaFromS3(key),
        type: media.mimetype,
      };
    });

    // Wait for all uploads to complete
    const mediaFiles = await Promise.all(uploadPromises);
    let parsedAddress = JSON.parse(address);

    if (parsedAddress.lat == '' || parsedAddress.lng == '') {
      parsedAddress.lat = undefined;
      parsedAddress.lng = undefined;
    }

    const createdFundRaising = await createFundRaising({
      ngoId: ngoId,
      title,
      description,
      startDate: JSON.parse(startDate),
      endDate: JSON.parse(endDate),
      address: parsedAddress,
      amount: JSON.parse(amount),
      tags: JSON.parse(tags),
      media: mediaFiles,
    });

    return res.json({
      success: true,
      data: createdFundRaising,
    });
  } catch (error) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    next(error);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const fundRaisings = await getFundRaisings();

    const filteredFundRaisingsForLoggedInUser = fundRaisings.map((fund) => {
      return {
        ...fund,
        loggedInUserOrNgoDetailsForFundRaising: {
          isOwner:
            fund.userId === req.payload.id
              ? true
              : fund.ngoId === req.payload.id
              ? true
              : false,
        },
      };
    });

    return res.json({
      success: true,
      data: filteredFundRaisingsForLoggedInUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:fundRaisingId', isAuthenticated, async (req, res, next) => {
  try {
    const { fundRaisingId } = req.params;

    const fundRaising = await getFundRaisingById(fundRaisingId);

    if (!fundRaising) {
      throw new Error('FundRaising not found');
    }

    const filteredFundRaisingForLoggedInUser = {
      ...fundRaising,
      loggedInUserOrNgoDetailsForFundRaising: {
        isOwner:
          fundRaising.userId === req.payload.id
            ? true
            : fundRaising.ngoId === req.payload.id
            ? true
            : false,
      },
    };

    return res.json({
      success: true,
      data: filteredFundRaisingForLoggedInUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
