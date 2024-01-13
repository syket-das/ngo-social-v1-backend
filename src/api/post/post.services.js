const { db } = require('../../utils/db');

const createPost = (post) => {
  return db.post.create({
    data: {
      ...post,
    },
  });
};

const allPosts = () => {
  return db.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
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
      ownUser: true,
      ownNgo: true,
    },
  });
};

const findPostById = (id) => {
  return db.post.findUnique({
    where: {
      id,
    },
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
      ownUser: true,
      ownNgo: true,
    },
  });
};

const findPostsByUserId = (userId) => {
  return db.post.findMany({
    where: {
      ownUserId: userId,
    },
  });
};

const findPostsByNgoId = (ngoId) => {
  return db.post.findMany({
    where: {
      ownNgoId: ngoId,
    },
  });
};

module.exports = {
  createPost,
  allPosts,
  findPostById,
  findPostsByUserId,
  findPostsByNgoId,
};
