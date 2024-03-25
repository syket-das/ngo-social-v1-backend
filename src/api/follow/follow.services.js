const { db } = require('../../utils/db');

function followUser(followData) {
  return db.follow.create({
    data: followData,
  });
}

function unfollowUser(followData) {
  return db.follow.delete({
    where: followData,
  });
}

function getFollowersByUser(userId) {
  return db.follow.findMany({
    where: {
      followingUserId: userId,
    },
  });
}

function getFollowingByUser(userId) {
  return db.follow.findMany({
    where: {
      followerUserId: userId,
    },
  });
}

function getFollowersCountByUser(userId) {
  return db.follow.count({
    where: {
      followingUserId: userId,
    },
  });
}

function getFollowingCountByUser(userId) {
  return db.follow.count({
    where: {
      followerUserId: userId,
    },
  });
}

function isFollowing(followerUserId, followingUserId) {
  return db.follow.findFirst({
    where: {
      followerUserId,
      followingUserId,
    },
  });
}

function getFollowersByNgo(ngoId) {
  return db.follow.findMany({
    where: {
      followingNgoId: ngoId,
    },
  });
}

function getFollowingByNgo(ngoId) {
  return db.follow.findMany({
    where: {
      followerNgoId: ngoId,
    },
  });
}

function getFollowersCountByNgo(ngoId) {
  return db.follow.count({
    where: {
      followingNgoId: ngoId,
    },
  });
}

function getFollowingCountByNgo(ngoId) {
  return db.follow.count({
    where: {
      followerNgoId: ngoId,
    },
  });
}

function isFollowingNgo(followerNgoId, followingNgoId) {
  return db.follow.findFirst({
    where: {
      followerNgoId,
      followingNgoId,
    },
  });
}

module.exports = {
  followUser,
  unfollowUser,
};
