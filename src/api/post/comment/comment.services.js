const { db } = require('../../../utils/db');

const createPostComment = (comment) => {
  return db.postComment.create({
    data: {
      ...comment,
    },
  });
};

const findPostCommentsByPostId = (postId) => {
  return db.postComment.findMany({
    where: {
      postId,
    },

    include: {
      votes: true,
    },
  });
};

const findPostCommentById = (id) => {
  return db.postComment.findUnique({
    where: {
      id,
    },
  });
};

module.exports = {
  createPostComment,
  findPostCommentsByPostId,
  findPostCommentById,
};
