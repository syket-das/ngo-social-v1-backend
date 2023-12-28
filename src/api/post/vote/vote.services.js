const { db } = require('../../../utils/db');

const createPostVote = (vote) => {
  return db.postVote.create({
    data: {
      ...vote,
    },
  });
};

const findPostVotesByPostId = (postId) => {
  return db.postVote.findMany({
    where: {
      postId: postId,
    },
  });
};

const findPostVoteForUser = (postId, userId) => {
  return db.postVote.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });
};

const findPostVoteForNgo = (postId, ngoId) => {
  return db.postVote.findFirst({
    where: {
      ngoId: ngoId,
      postId: postId,
    },
  });
};

const findPostVoteById = (voteId) => {
  return db.postVote.findUnique({
    where: {
      id: voteId,
    },
  });
};

const updatePostVote = (voteId, vote) => {
  return db.postVote.update({
    where: {
      id: voteId,
    },
    data: {
      ...vote,
    },
  });
};

const deletePostVote = (voteId) => {
  return db.postVote.delete({
    where: {
      id: voteId,
    },
  });
};

module.exports = {
  createPostVote,
  findPostVotesByPostId,
  findPostVoteById,
  findPostVoteForUser,
  findPostVoteForNgo,

  updatePostVote,
  deletePostVote,
};
