const { db } = require('../../../../utils/db');

const createPostCommentVote = (data) => {
  return db.postCommentVote.create({
    data: {
      ...data,
    },
  });
};

const findPostCommentVotesByCommentId = (commentId) => {
  return db.postCommentVote.findMany({
    where: {
      commentId,
    },
  });
};

const updatePostCommentVote = (voteId, vote) => {
  return db.postCommentVote.update({
    where: {
      id: voteId,
    },
    data: {
      ...vote,
    },
  });
};

const deletePostCommentVote = (voteId) => {
  return db.postCommentVote.delete({
    where: {
      id: voteId,
    },
  });
};

const findPostCommentVoteById = (voteId) => {
  return db.postCommentVote.findUnique({
    where: {
      id: voteId,
    },
  });
};
const findPostCommentVoteForUser = (commentId, userId) => {
  return db.postCommentVote.findFirst({
    where: {
      commentId,
      userId,
    },
  });
};

const findPostCommentVoteForNgo = (commentId, ngoId) => {
  return db.postCommentVote.findFirst({
    where: {
      commentId,
      ngoId,
    },
  });
};

module.exports = {
  createPostCommentVote,
  findPostCommentVotesByCommentId,
  updatePostCommentVote,
  deletePostCommentVote,
  findPostCommentVoteById,
  findPostCommentVoteForUser,
  findPostCommentVoteForNgo,
};
