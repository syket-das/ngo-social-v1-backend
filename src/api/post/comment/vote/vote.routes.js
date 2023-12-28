const express = require('express');

const { isAuthenticated } = require('../../../../middlewares');
const { findUserById } = require('../../../users/users.services');
const { Role } = require('@prisma/client');
const { findPostCommentById } = require('../comment.services');
const {
  findPostCommentVoteForUser,
  deletePostCommentVote,
  updatePostCommentVote,
  createPostCommentVote,
  findPostCommentVoteForNgo,
} = require('./vote.services');
const { findNgoById } = require('../../../ngo/ngo.services');

const router = express.Router();

router.patch('/mutate/user', isAuthenticated, async (req, res, next) => {
  try {
    const { commentId, voteType } = req.body;

    if (!commentId || !voteType) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: userId } = req.payload;

    const userExist = await findUserById(userId);

    if (!userExist || userExist?.role !== Role.USER) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const commentExist = await findPostCommentById(commentId);

    if (!commentExist) {
      res.status(404);
      throw new Error('Comment not found.');
    }

    const voteExist = await findPostCommentVoteForUser(commentId, userId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deletePostCommentVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updatePostCommentVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const newVote = await createPostCommentVote({
      commentId,
      userId,
      voteType,
    });

    return res.status(201).json({
      success: true,
      data: newVote,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/mutate/ngo', isAuthenticated, async (req, res, next) => {
  try {
    const { commentId, voteType } = req.body;

    if (!commentId || !voteType) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('NGO not found or not authorized.');
    }

    const commentExist = await findPostCommentById(commentId);

    if (!commentExist) {
      res.status(404);
      throw new Error('Comment not found.');
    }

    const voteExist = await findPostCommentVoteForNgo(commentId, ngoId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deletePostCommentVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updatePostCommentVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const newVote = await createPostCommentVote({
      commentId,
      ngoId,
      voteType,
    });

    return res.status(201).json({
      success: true,
      data: newVote,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
