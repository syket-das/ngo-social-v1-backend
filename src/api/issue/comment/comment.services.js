const { db } = require('../../../utils/db');

const createIssueComment = (comment) => {
  return db.issueComment.create({
    data: {
      ...comment,
    },
  });
};

const findIssueCommentsByIssueId = (issueId) => {
  return db.issueComment.findMany({
    where: {
      issueId,
    },

    include: {
      votes: true,
      children: true,
    },
  });
};

const findIssueCommentById = (id) => {
  return db.issueComment.findUnique({
    where: {
      id,
    },

    include: {
      votes: true,
      children: true,
    },
  });
};

module.exports = {
  createIssueComment,
  findIssueCommentsByIssueId,
  findIssueCommentById,
};
