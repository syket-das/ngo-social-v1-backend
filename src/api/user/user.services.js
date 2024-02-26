const { db } = require('../../utils/db');

function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUser(user) {
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
    include: {
      createdCampaigns: {
        include: {
          joinedUsers: true,
          joinedNgos: true,
        },
      },
      createdIssues: {
        include: {
          votes: true,
        },
      },
      memberOfNgos: true,
      joinedCampaigns: true,
      createdPosts: {
        include: {
          votes: true,
        },
      },
    },
  });
}

const updateUser = (id, body) => {
  return db.user.update({
    where: { id },
    data: {
      ...body,
    },
  });
};

const allUsers = () => {
  return db.user.findMany({});
};

const searchUserByFullName = (fullName) => {
  return db.user.findMany({
    where: {
      fullName: {
        contains: fullName,
        mode: 'insensitive',
      },
    },
    include: {
      createdCampaigns: {
        include: {
          joinedUsers: true,
          joinedNgos: true,
          ownUser: true,
          ownNgo: true,
          campaignBroadcasts: true,
        },
      },
      createdIssues: {
        include: {
          votes: true,
          comments: {
            orderBy: {
              // most voted comments first
              votes: {
                _count: 'desc',
              },
            },

            include: {
              votes: true,
              user: true,
              ngo: true,
            },
          },
          ownUser: true,
          ownNgo: true,
        },
      },
      memberOfNgos: true,
      joinedCampaigns: true,
      createdPosts: {
        include: {
          votes: true,
          comments: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              votes: true,
              user: true,
              ngo: true,
            },
          },
          ownNgo: true,
          ownUser: true,
        },
      },
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  allUsers,
  searchUserByFullName,
};
