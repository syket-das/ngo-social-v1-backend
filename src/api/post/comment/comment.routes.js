const express = require('express');
const { isAuthenticated } = require('../../../middlewares');
const { findUserById } = require('../../users/users.services');
const { findPostById } = require('../post.services');
const { createPostComment } = require('./comment.services');
const { findNgoById } = require('../../ngo/ngo.services');
const { Role } = require('@prisma/client');

const postCommentVote = require('./vote/vote.routes');

const router = express.Router();

router.use('/vote', postCommentVote);

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  try {
    const { postId, comment } = req.body;

    if (!postId || !comment) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: userId } = req.payload;

    const userExist = await findUserById(userId);

    if (!userExist || userExist?.role !== Role.USER) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const postExist = await findPostById(postId);

    if (!postExist) {
      res.status(404);
      throw new Error('Post not found.');
    }

    const postComment = await createPostComment({
      postId,
      comment,
      userId,
    });

    res.status(201).json({
      success: true,
      data: postComment,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  try {
    const { postId, comment } = req.body;

    if (!postId || !comment) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const postExist = await findPostById(postId);

    if (!postExist) {
      res.status(404);
      throw new Error('Post not found.');
    }

    const postComment = await createPostComment({
      postId,
      ngoId,
      comment,
    });

    res.status(201).json({
      success: true,
      data: postComment,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
