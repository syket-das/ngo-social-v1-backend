const { db } = require('../../utils/db');

const createCampaign = (campaign) => {
  return db.campaign.create({
    data: campaign,
  });
};

const getCampaigns = () => {
  return db.campaign.findMany({
    include: {
      joinedUsers: true,
      joinedNgos: true,
      ownUser: true,
      ownNgo: true,
      campaignBroadcasts: true,
      transactions: true,
    },
  });
};

const getCampaignById = (id) => {
  return db.campaign.findUnique({
    where: {
      id,
    },
    include: {
      joinedUsers: true,
      joinedNgos: true,
      ownUser: true,
      ownNgo: true,
      campaignBroadcasts: true,
      transactions: true,
    },
  });
};

const updateCampaignById = (id, campaign) => {
  return db.campaign.update({
    data: campaign,
    where: {
      id,
    },
  });
};

const joinCampaignAsUser = (campaignId, userId) => {
  return db.campaign.update({
    data: {
      joinedUsers: {
        connect: {
          id: userId,
        },
      },
    },
    where: {
      id: campaignId,
    },
  });
};

const joinCampaignAsNgo = (campaignId, ngoId) => {
  return db.campaign.update({
    data: {
      joinedNgos: {
        connect: {
          id: ngoId,
        },
      },
    },
    where: {
      id: campaignId,
    },
  });
};

const checkIfUserJoinedCampaign = (campaignId, userId) => {
  return db.campaign.findFirst({
    where: {
      id: campaignId,
      joinedUsers: {
        some: {
          id: userId,
        },
      },
    },
  });
};

const checkIfNgoJoinedCampaign = (campaignId, ngoId) => {
  return db.campaign.findFirst({
    where: {
      id: campaignId,
      joinedNgos: {
        some: {
          id: ngoId,
        },
      },
    },
  });
};

const leaveCampaignAsUser = (campaignId, userId) => {
  return db.campaign.update({
    data: {
      joinedUsers: {
        disconnect: {
          id: userId,
        },
      },
    },
    where: {
      id: campaignId,
    },
  });
};

const leaveCampaignAsNgo = (campaignId, ngoId) => {
  return db.campaign.update({
    data: {
      joinedNgos: {
        disconnect: {
          id: ngoId,
        },
      },
    },
    where: {
      id: campaignId,
    },
  });
};

const broadcastCampaign = (broadcast) => {
  return db.campaignBroadcast.create({
    data: broadcast,
  });
};

const deleteBroadcast = (id) => {
  return db.campaignBroadcast.delete({
    where: {
      id,
    },
  });
};

const getCampaignBroadcastById = (id) => {
  return db.campaignBroadcast.findUnique({
    where: {
      id,
    },
  });
};

const donateToCampaign = (campaignId, data) => {
  return db.campaign.update({
    data: {
      transactions: {
        create: {
          data,
        },
      },
    },

    where: {
      id: campaignId,
    },
  });
};

const checkIfNgoOwnsCampaign = (campaignId, ngoId) => {
  return db.campaign.findFirst({
    where: {
      id: campaignId,
      ownNgo: {
        id: ngoId,
      },
    },
  });
};

const checkIfUserOwnsCampaign = (campaignId, userId) => {
  return db.campaign.findFirst({
    where: {
      id: campaignId,
      ownUser: {
        id: userId,
      },
    },
  });
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignById,
  joinCampaignAsUser,
  joinCampaignAsNgo,
  leaveCampaignAsUser,
  leaveCampaignAsNgo,
  checkIfUserJoinedCampaign,
  checkIfNgoJoinedCampaign,
  broadcastCampaign,
  deleteBroadcast,
  getCampaignBroadcastById,
  donateToCampaign,
  checkIfNgoOwnsCampaign,
  checkIfUserOwnsCampaign,
};
