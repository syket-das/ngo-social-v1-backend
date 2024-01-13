const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../users/users.services');
const { Role } = require('@prisma/client');
const { createPost, allPosts } = require('./post.services');
const postVote = require('./vote/vote.routes');
const postComment = require('./comment/comment.routes');
const { findNgoById } = require('../ngo/ngo.services');

const router = express.Router();

router.use('/vote', postVote);
router.use('/comment', postComment);

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const posts = await allPosts();

    const filteredPostsForLoggedInUser = posts.map((post) => {
      return {
        ...post,
        loggedInUserOrNgoDetailsForPost: {
          isVoted: post.votes.some((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          }),

          voteTypeIfVoted: post.votes.find((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          })?.voteType,
        },

        upVoteCount: post.votes.filter((vote) => vote.voteType === 'UPVOTE')
          .length,

        commentsCount: post.comments.length,
      };
    });

    res.json({
      success: true,
      data: filteredPostsForLoggedInUser,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, address } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: userId } = req.payload;

    const userExist = await findUserById(userId);

    if (!userExist || userExist?.role !== Role.USER) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const post = await createPost({
      title,
      description,
      address,
      ownUserId: userId,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, address } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('Ngo not found or not authorized.');
    }

    const post = await createPost({
      title,
      description,
      address,
      ownNgoId: ngoId,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
