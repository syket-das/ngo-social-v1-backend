const express = require('express');

const { findUserById } = require('../../user/user.services');
const { isAuthenticated } = require('../../../middlewares');

const { findNgoById } = require('../../ngo/ngo.services');
const { Role } = require('@prisma/client');
const { getIssueById } = require('../issue.services');
const {
  findIssueVoteForUser,
  deleteIssueVote,
  updateIssuetVote,
  createIssueVote,
  findIssueVoteForNgo,
} = require('./vote.services');

const router = express.Router();

router.patch('/mutate/user', isAuthenticated, async (req, res, next) => {
  try {
    const { issueId, voteType } = req.body;

    if (!issueId || !voteType) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: userId } = req.payload;

    const userExist = await findUserById(userId);

    if (!userExist || userExist?.role !== Role.USER) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const issueExist = await getIssueById(issueId);

    if (!issueExist) {
      res.status(404);
      throw new Error('Issue not found.');
    }

    const voteExist = await findIssueVoteForUser(issueId, userId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deleteIssueVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updateIssuetVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const vote = await createIssueVote({
      issueId,
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
    const { issueId, voteType } = req.body;

    if (!issueId || !voteType) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('Ngo not found or not authorized.');
    }

    const issueExist = await getIssueById(issueId);

    if (!issueExist) {
      res.status(404);
      throw new Error('Issue not found.');
    }

    const voteExist = await findIssueVoteForNgo(issueId, ngoId);

    if (voteExist) {
      if (voteExist.voteType === voteType) {
        const delVote = await deleteIssueVote(voteExist.id);

        return res.status(200).json({
          success: true,
          message: 'Vote deleted.',
        });
      } else {
        const updateVote = await updateIssueVote(voteExist.id, {
          voteType,
        });

        return res.status(200).json({
          success: true,
          data: updateVote,
        });
      }
    }

    const vote = await createPostVote({
      issueId,
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
