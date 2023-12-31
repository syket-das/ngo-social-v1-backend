const express = require('express');

const { Role } = require('@prisma/client');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../users/users.services');
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
} = require('./campaign.services');
const { findNgoById } = require('../ngo/ngo.services');

const router = express.Router();

router.post('/create/user', isAuthenticated, async (req, res, next) => {
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

    if (!title || !description || !motto || !startDate || !endDate) {
      throw new Error('All fields are required');
    }

    const userExist = await findUserById(userId);

    if (!userExist || userExist.role !== Role.USER) {
      throw new Error('User not found');
    }

    const createdCampaign = await createCampaign({
      ownUserId: userId,
      title,
      description,
      motto,
      startDate,
      endDate,
      address,
      virtual: virtual || undefined,
      fundsRequired: fundsRequired || undefined,
      tags,
    });

    return res.json({
      success: true,
      data: createdCampaign,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
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

    if (!title || !description || !motto || !startDate || !endDate) {
      throw new Error('All fields are required');
    }

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist.role !== Role.NGO) {
      throw new Error('Ngo not found');
    }

    const createdCampaign = await createCampaign({
      ownNgoId: ngoId,
      title,
      description,
      motto,
      startDate,
      endDate,
      address,
      virtual,
      fundsRequired,
      tags,
    });

    return res.json({
      success: true,
      data: createdCampaign,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  'member/mutate/user/:campaignId',
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

router.get('/all', async (req, res, next) => {
  try {
    const campaigns = await getCampaigns();

    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
