const express = require('express');

const { findPostById } = require('../post.services');
const { findUserById } = require('../../users/users.services');
const { isAuthenticated } = require('../../../middlewares');
const {
  createPostVote,
  findPostVoteForUser,
  deletePostVote,
  updatePostVote,
  findPostVoteForNgo,
} = require('./vote.services');
const { findNgoById } = require('../../ngo/ngo.services');
const { Role } = require('@prisma/client');

const router = express.Router();

router.patch('/mutate/user', isAuthenticated, async (req, res, next) => {
  try {
    const { postId, voteType } = req.body;

    if (!postId || !voteType) {
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

    const voteExist = await findPostVoteForUser(postId, userId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deletePostVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updatePostVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const vote = await createPostVote({
      postId,
      userId,
      voteType,
    });

    return res.status(201).json({
      success: true,
      data: vote,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/mutate/ngo', isAuthenticated, async (req, res, next) => {
  try {
    const { postId, voteType } = req.body;

    if (!postId || !voteType) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('Ngo not found or not authorized.');
    }

    const postExist = await findPostById(postId);

    if (!postExist) {
      res.status(404);
      throw new Error('Post not found.');
    }

    const voteExist = await findPostVoteForNgo(postId, ngoId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deletePostVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updatePostVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const vote = await createPostVote({
      postId,
      ngoId,
      voteType,
    });

    return res.status(201).json({
      success: true,
      data: vote,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
