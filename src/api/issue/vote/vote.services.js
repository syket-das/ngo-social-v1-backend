const { db } = require('../../../utils/db');

const createIssueVote = (vote) => {
  return db.issueVote.create({
    data: {
      ...vote,
    },
  });
};

const findIssueVotesByIssueId = (issueId) => {
  return db.issueVote.findMany({
    where: {
      issueId: issueId,
    },
  });
};

const findIssueVoteForUser = (issueId, userId) => {
  return db.issueVote.findFirst({
    where: {
      userId: userId,
      issueId: issueId,
    },
  });
};

const findIssueVoteForNgo = (issueId, ngoId) => {
  return db.issueVote.findFirst({
    where: {
      ngoId: ngoId,
      issueId: issueId,
    },
  });
};

const findIssueVoteById = (voteId) => {
  return db.issueVote.findUnique({
    where: {
      id: voteId,
    },
  });
};

const updateIssuetVote = (voteId, vote) => {
  return db.issueVote.update({
    where: {
      id: voteId,
    },
    data: {
      ...vote,
    },
  });
};

const deleteIssueVote = (voteId) => {
  return db.issueVote.delete({
    where: {
      id: voteId,
    },
  });
};

module.exports = {
  createIssueVote,
  findIssueVotesByIssueId,
  findIssueVoteForUser,
  findIssueVoteForNgo,
  findIssueVoteById,
  updateIssuetVote,
  deleteIssueVote,
};
