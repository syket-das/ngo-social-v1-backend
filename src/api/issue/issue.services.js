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
      comments: true,
      votes: true,
      ownNgo: true,
      ownUser: true,
    },
  });
};

const getIssues = () => {
  return db.issue.findMany({
    include: {
      comments: {
        where: {
          parent: null,
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
