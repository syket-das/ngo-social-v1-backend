const { db } = require('../../utils/db');

const createIssue = (issue) => {
  return db.issue.create({
    data: issue,
  });
};

const getIssueById = (id) => {
  return db.issue.findUnique({
    where: {
      id,
    },

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
  });
};

const getIssues = (query) => {
  return db.issue.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query || '',
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query || '',
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
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
      votes: true,
      ownNgo: true,
      ownUser: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const updateIssueById = (id, issue) => {
  return db.issue.update({
    data: issue,
    where: {
      id,
    },
    include: {
      comments: true,
      votes: true,
      ownNgo: true,
      ownUser: true,
    },
  });
};

const deleteIssueById = (id) => {
  return db.issue.delete({
    where: {
      id,
    },
  });
};

const getIssueByUserId = (userId) => {
  return db.issue.findMany({
    where: {
      ownUserId: userId,
    },
    include: {
      comments: true,
      votes: true,
      ownNgo: true,
      ownUser: true,
    },
  });
};

const getIssueByNgoId = (ngoId) => {
  return db.issue.findMany({
    where: {
      ownNgoId: ngoId,
    },
    include: {
      comments: true,
      votes: true,
      ownNgo: true,
      ownUser: true,
    },
  });
};

module.exports = {
  createIssue,
  getIssueById,
  getIssues,
  updateIssueById,
  deleteIssueById,
  getIssueByUserId,
  getIssueByNgoId,
};
