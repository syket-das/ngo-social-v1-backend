const express = require('express');

const { Role } = require('@prisma/client');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../user/user.services');
const {
  createCampaign,
  getCampaigns,
  joinCampaignAsUser,
  getCampaignById,
  joinCampaignAsNgo,
  checkIfNgoJoinedCampaign,
  leaveCampaignAsNgo,
  checkIfUserJoinedCampaign,
  leaveCampaignAsUser,
  broadcastCampaign,
  deleteBroadcast,
  getCampaignBroadcastById,
  checkIfNgoOwnsCampaign,
  checkIfUserOwnsCampaign,
} = require('./campaign.services');
const { findNgoById } = require('../ngo/ngo.services');
const {
  getMediaFromS3,
  addMediaToS3,
  deleteMediaFromS3,
} = require('../../utils/s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  const isoDate = new Date().toISOString();
  const mediaAvailable = req.files && req.files.length > 0;
  let mKeys = [];

  try {
    const { id: userId } = req.payload;

    const {
      title,
      description,
      motto,
      startDate,
      endDate,
      address,
      virtual,
      fundsRequired,
      tags,
    } = req.body;

    if (
      !title ||
      !description ||
      !motto ||
      !startDate ||
      !endDate ||
      !mediaAvailable
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
      const key = `campaign/user/${userId}/${mediaName}`;

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

    const createdCampaign = await createCampaign({
      ownUserId: userId,
      title,
      description,
      motto,
      startDate: JSON.parse(startDate),
      endDate: JSON.parse(endDate),
      address: JSON.parse(address),
      virtual: JSON.parse(virtual),
      fundsRequired: JSON.parse(fundsRequired),
      tags: JSON.parse(tags),
      media: mediaFiles,
    });

    return res.json({
      success: true,
      data: createdCampaign,
    });
  } catch (error) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    next(error);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  const mediaAvailable = req.files && req.files.length > 0;

  let mKeys = [];
  try {
    const { id: ngoId } = req.payload;

    const {
      title,
      description,
      motto,
      startDate,
      endDate,
      address,
      virtual,
      fundsRequired,
      tags,
    } = req.body;

    if (
      !title ||
      !description ||
      !motto ||
      !startDate ||
      !endDate ||
      !mediaAvailable
    ) {
      throw new Error('All fields are required');
    }

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist.role !== Role.NGO) {
      throw new Error('Ngo not found');
    }

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `campaign/ngo/${ngoId}/${mediaName}`;

      mKeys.push(key);

      // Upload media to S3
      const response = await addMediaToS3({
        key: key,
        body: media.buffer,
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

    const createdCampaign = await createCampaign({
      ownNgoId: ngoId,
      title,
      description,
      motto,
      startDate: JSON.parse(startDate),
      endDate: JSON.parse(endDate),
      address: JSON.parse(address),
      virtual: JSON.parse(virtual),
      fundsRequired: JSON.parse(fundsRequired),
      tags: JSON.parse(tags),
      media: mediaFiles,
    });

    return res.json({
      success: true,
      data: createdCampaign,
    });
  } catch (error) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    next(error);
  }
});

router.patch(
  '/member/mutate/user/:campaignId',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id: userId } = req.payload;
      const { campaignId } = req.params;

      const userExist = await findUserById(userId);

      if (!userExist || userExist.role !== Role.USER) {
        throw new Error('User not found');
      }

      const campaignExist = await getCampaignById(campaignId);

      if (!campaignExist) {
        throw new Error('Campaign not found');
      }

      const isMember = await checkIfUserJoinedCampaign(campaignId, userId);

      if (isMember) {
        const updatedCampaign = await leaveCampaignAsUser(campaignId, userId);

        return res.json({
          success: true,
          message: 'Left campaign successfully',
        });
      } else {
        const updatedCampaign = await joinCampaignAsUser(campaignId, userId);

        return res.json({
          success: true,
          message: 'Joined campaign successfully',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/member/mutate/ngo/:campaignId',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id: ngoId } = req.payload;
      const { campaignId } = req.params;

      const ngoExist = await findNgoById(ngoId);

      if (!ngoExist || ngoExist.role !== Role.NGO) {
        throw new Error('Ngo not found');
      }

      const campaignExist = await getCampaignById(campaignId);

      if (!campaignExist) {
        throw new Error('Campaign not found');
      }

      const isMember = await checkIfNgoJoinedCampaign(campaignId, ngoId);

      if (isMember) {
        const updatedCampaign = await leaveCampaignAsNgo(campaignId, ngoId);

        return res.json({
          success: true,
          message: 'Left campaign successfully',
        });
      } else {
        const updatedCampaign = await joinCampaignAsNgo(campaignId, ngoId);
        return res.json({
          success: true,
          message: 'Joined campaign successfully',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/member/force-leave/ngo/:campaignId/:ngoId',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id: ownerId } = req.payload;
      const { campaignId, ngoId } = req.params;

      const ngoExist = await findNgoById(ngoId);

      if (!ngoExist || ngoExist.role !== Role.NGO) {
        throw new Error('Ngo not found');
      }

      const campaignExist = await getCampaignById(campaignId);

      if (!campaignExist) {
        throw new Error('Campaign not found');
      }

      const checkForOwner = await checkIfNgoOwnsCampaign(campaignId, ownerId);
      const checkFOrOwner2 = await checkIfUserOwnsCampaign(campaignId, ownerId);

      if (!checkForOwner || !checkFOrOwner2) {
        throw new Error('Not authorized to force leave ngo');
      }

      const isMember = await checkIfNgoJoinedCampaign(campaignId, ngoId);

      if (isMember) {
        const updatedCampaign = await leaveCampaignAsNgo(campaignId, ngoId);

        return res.json({
          success: true,
          message: 'Left campaign successfully',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/member/force-leave/user/:campaignId/:userId',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id: ownerId, role } = req.payload;
      const { campaignId, userId } = req.params;

      const userExist = await findUserById(userId);

      if (!userExist || userExist.role !== Role.USER) {
        throw new Error('User not found');
      }

      const campaignExist = await getCampaignById(campaignId);

      if (!campaignExist) {
        throw new Error('Campaign not found');
      }

      let owner = false;

      // const checkForOwner = await checkIfNgoOwnsCampaign(campaignId, ownerId);
      // const checkFOrOwner2 = await checkIfUserOwnsCampaign(campaignId, ownerId);

      if (role === Role.NGO) {
        const checkForOwner = await checkIfNgoOwnsCampaign(campaignId, ownerId);

        if (!checkForOwner) {
          throw new Error('Not authorized to force leave ngo');
        }

        if (checkForOwner?.ownNgoId === ownerId) {
          owner = true;
        }
      }

      if (role === Role.USER) {
        const checkFOrOwner2 = await checkIfUserOwnsCampaign(
          campaignId,
          ownerId
        );

        if (!checkFOrOwner2) {
          throw new Error('Not authorized to force leave ngo');
        }

        if (checkFOrOwner2?.ownUserId === ownerId) {
          owner = true;
        }
      }

      if (!owner) {
        throw new Error('Not authorized to force leave ngo');
      }

      const isMember = await checkIfUserJoinedCampaign(campaignId, userId);

      if (isMember) {
        const updatedCampaign = await leaveCampaignAsUser(campaignId, userId);

        return res.json({
          success: true,
          message: 'Left campaign successfully',
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const campaigns = await getCampaigns();

    const filteredCampaignsForLoggedInUser = campaigns.map((campaign) => {
      return {
        ...campaign,
        loggedInUserOrNgoDetailsForCampaign: {
          isOwner:
            campaign.ownUserId === req.payload.id
              ? true
              : campaign.ownNgoId === req.payload.id
              ? true
              : false,
          isJoined: campaign.joinedUsers?.some(
            (user) => user.id === req.payload.id
          )
            ? true
            : campaign.joinedNgos?.some((ngo) => ngo.id === req.payload.id)
            ? true
            : false,
        },
      };
    });

    return res.json({
      success: true,
      data: filteredCampaignsForLoggedInUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:campaignId', isAuthenticated, async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const filteredCampaignForLoggedInUser = {
      ...campaign,
      loggedInUserOrNgoDetailsForCampaign: {
        isOwner:
          campaign.ownUserId === req.payload.id
            ? true
            : campaign.ownNgoId === req.payload.id
            ? true
            : false,
        isJoined: campaign.joinedUsers?.some(
          (user) => user.id === req.payload.id
        )
          ? true
          : campaign.joinedNgos?.some((ngo) => ngo.id === req.payload.id)
          ? true
          : false,
      },
    };

    return res.json({
      success: true,
      data: filteredCampaignForLoggedInUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// api broadcast messages

router.post('/broadcast', isAuthenticated, async (req, res, next) => {
  const { id } = req.payload;
  const { campaignId, message } = req.body;

  if (!campaignId || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  try {
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (req.payload.role == Role.NGO) {
      if (campaign.ownNgoId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to broadcast message',
        });
      }

      const campaignBroadcast = await broadcastCampaign({
        campaignId,
        message,
      });

      return res.json({
        success: true,
        data: campaignBroadcast,
      });
    } else if (req.payload.role == Role.USER) {
      if (campaign.ownUserId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to broadcast message',
        });
      }

      const campaignBroadcast = await broadcastCampaign({
        campaignId,
        message,
      });

      return res.json({
        success: true,
        data: campaignBroadcast,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.delete('/broadcast/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.payload;
  const { id: broadcastId } = req.params;

  try {
    const broadcast = await getCampaignBroadcastById(broadcastId);

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    const campaign = await getCampaignById(broadcast.campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (req.payload.role == Role.NGO) {
      if (campaign.ownNgoId !== id) {
        throw new Error('Not authorized to delete broadcast');
      }

      const deletedBroadcast = await deleteBroadcast(broadcastId);

      return res.json({
        success: true,
        data: deletedBroadcast,
      });
    } else if (req.payload.role == Role.USER) {
      if (campaign.ownUserId !== id) {
        throw new Error('Not authorized to delete broadcast');
      }

      const deletedBroadcast = await deleteBroadcast(broadcastId);

      return res.json({
        success: true,
        data: deletedBroadcast,
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
