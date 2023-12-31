const { db } = require('../../../../utils/db');

const createIssueCommentVote = (data) => {
  return db.issueCommentVote.create({
    data: {
      ...data,
    },
  });
};

const findIssueCommentVotesByCommentId = (commentId) => {
  return db.issueCommentVote.findMany({
    where: {
      commentId,
    },
  });
};

const updateIssueCommentVote = (voteId, vote) => {
  return db.issueCommentVote.update({
    where: {
      id: voteId,
    },
    data: {
      ...vote,
    },
  });
};

const deleteIssueCommentVote = (voteId) => {
  return db.issueCommentVote.delete({
    where: {
      id: voteId,
    },
  });
};

const findIssueCommentVoteById = (voteId) => {
  return db.issueCommentVote.findUnique({
    where: {
      id: voteId,
    },
  });
};
const findIssueCommentVoteForUser = (commentId, userId) => {
  return db.issueCommentVote.findFirst({
    where: {
      commentId,
      userId,
    },
  });
};

const findIssueCommentVoteForNgo = (commentId, ngoId) => {
  return db.issueCommentVote.findFirst({
    where: {
      commentId,
      ngoId,
    },
  });
};

module.exports = {
  createIssueCommentVote,
  findIssueCommentVotesByCommentId,
  updateIssueCommentVote,
  findIssueCommentVoteById,
  findIssueCommentVoteForUser,
  findIssueCommentVoteForNgo,
  deleteIssueCommentVote,
};
