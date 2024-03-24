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
      fundRaisings: {
        include: {
          user: true,
          ngo: true,
          transactions: true,
        },
      },
      userPoints: true,
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

const allUsers = async () => {
  // `user has userpoints array of objects every object contains donation, volunteer, and other points need sun of all points and return user with total points`

  const users = await db.user.findMany({
    include: {
      userPoints: true,
    },
  });

  return users.map((user) => {
    let totalPoints = 0;

    user.userPoints.forEach((point) => {
      totalPoints += point.donation + point.volunteer + point.intellectual;
    });

    return {
      ...user,
      totalPoints,
    };
  });
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
      userPoints: true,
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
