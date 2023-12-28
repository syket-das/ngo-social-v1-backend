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

module.exports = {
  createPostComment,
  findPostCommentsByPostId,
};
