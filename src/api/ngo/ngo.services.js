const { db } = require('../../utils/db');

function findNgoByEmail(email) {
  return db.ngo.findUnique({
    where: {
      email,
    },
  });
}

function findNgoById(id) {
  return db.ngo.findUnique({
    where: {
      id,
    },
    include: {
      createdPosts: {
        include: {
          votes: true,
        },
      },
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
    },
  });
}

function createNgo(ngo) {
  return db.ngo.create({
    data: ngo,
  });
}

const updateNgo = (id, body) => {
  return db.ngo.update({
    where: { id },
    data: {
      ...body,
    },
  });
};

const allNGOs = () => {
  return db.ngo.findMany({
    include: {},
  });
};

const searchNgoByName = (name) => {
  return db.ngo.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
    include: {
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
    },
  });
};

module.exports = {
  findNgoByEmail,
  findNgoById,
  createNgo,
  updateNgo,
  allNGOs,
  searchNgoByName,
};
