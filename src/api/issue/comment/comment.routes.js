const express = require('express');
const { isAuthenticated } = require('../../../middlewares');
const { findUserById } = require('../../users/users.services');
const { findNgoById } = require('../../ngo/ngo.services');
const { Role } = require('@prisma/client');
const { getIssueById } = require('../issue.services');
const { createIssueComment } = require('./comment.services');

const issueCommentVote = require('./vote/vote.routes');

const router = express.Router();

router.use('/vote', issueCommentVote);

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  try {
    const { issueId, comment, parentId } = req.body;

    if (!issueId || !comment) {
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

    const issueComment = await createIssueComment({
      issueId,
      comment,
      userId,
      parentId,
    });

    res.status(201).json({
      success: true,
      data: issueComment,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  try {
    const { issueId, comment, parentId } = req.body;

    if (!issueId || !comment) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('User not found or not authorized.');
    }

    const issueExist = await getIssueById(issueId);

    if (!issueExist) {
      res.status(404);
      throw new Error('Issue not found.');
    }

    const issueComment = await createIssueComment({
      postId,
      ngoId,
      comment,
      parentId,
    });

    res.status(201).json({
      success: true,
      data: issueComment,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
