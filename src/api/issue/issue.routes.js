const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../users/users.services');
const { createIssue, getIssues, getIssueById } = require('./issue.services');
const { findNgoById } = require('../ngo/ngo.services');

const issueVote = require('./vote/vote.routes');
const issueComment = require('./comment/comment.routes');
const { Role } = require('@prisma/client');

const router = express.Router();

router.use('/vote', issueVote);
router.use('/comment', issueComment);

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

    const issue = await createIssue({
      title,
      description,
      address,
      ownUserId: userId,
    });

    res.status(201).json({
      success: true,
      data: issue,
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
      throw new Error('NGO not found or not authorized.');
    }

    const issue = await createIssue({
      title,
      description,
      address,
      ownNgoId: ngoId,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const issues = await getIssues();

    const filteredIssuesForLoggedInUser = issues.map((issue) => {
      return {
        ...issue,
        loggedInUserOrNgoDetailsForIssue: {
          isVoted: issue.votes.some((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          }),

          voteTypeIfVoted: issue.votes.find((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          })?.voteType,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: filteredIssuesForLoggedInUser,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const issue = await getIssueById(req.params.id);

    if (!issue) {
      res.status(404);
      throw new Error('Issue not found.');
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
