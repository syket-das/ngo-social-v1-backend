const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../user/user.services');
const { createIssue, getIssues, getIssueById } = require('./issue.services');
const { findNgoById } = require('../ngo/ngo.services');

const issueVote = require('./vote/vote.routes');
const issueComment = require('./comment/comment.routes');
const { Role } = require('@prisma/client');
const { addMediaToS3, getMediaFromS3 } = require('../../utils/s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use('/vote', issueVote);
router.use('/comment', issueComment);

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  const mediaAvailable = req.files && req.files.length > 0;

  let mKeys = [];

  try {
    const { title, description, address, tags } = req.body;

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

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `issue/user/${userId}/${mediaName}`;

      mKeys.push(key);

      // Upload media to S3
      const response = await addMediaToS3({
        key: key,
        body: media.buffer,
        mimetype: media.mimetype,
      });

      return {
        key,
        url: getMediaFromS3(key),
        type: media.mimetype,
      };
    });

    // Wait for all uploads to complete
    const mediaFiles = await Promise.all(uploadPromises);

    const issue = await createIssue({
      title,
      description,
      address: JSON.parse(address),
      tags: JSON.parse(tags),
      ownUserId: userId,
      media: mediaFiles,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });

    next(err);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  const mediaAvailable = req.files && req.files.length > 0;

  let mKeys = [];
  try {
    const { title, description, address, tags } = req.body;

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

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `issue/ngo/${ngoId}/${mediaName}`;

      mKeys.push(key);

      // Upload media to S3
      const response = await addMediaToS3({
        key: key,
        body: media.buffer,
        mimetype: media.mimetype,
      });

      return {
        key,
        url: getMediaFromS3(key),
        type: media.mimetype,
      };
    });

    // Wait for all uploads to complete
    const mediaFiles = await Promise.all(uploadPromises);

    const issue = await createIssue({
      title,
      description,
      address: JSON.parse(address),
      tags: JSON.parse(tags),
      ownNgoId: ngoId,
      media: mediaFiles,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    next(err);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const query = req.query.query || '';
    console.log(query);

    const issues = await getIssues(query);

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

          isCommented: issue.comments.some((comment) => {
            return comment.userId
              ? comment.userId === req.payload.id
              : comment.ngoId === req.payload.id;
          }),

          isVotedInComments: issue.comments.some((comment) => {
            return comment.votes.some((vote) => {
              return vote.userId
                ? vote.userId === req.payload.id
                : vote.ngoId === req.payload.id;
            });
          }),

          voteTypeWithCommentIfVoted: issue.comments
            .filter((comment) => {
              return comment.votes.some((vote) => {
                return vote.userId
                  ? vote.userId === req.payload.id
                  : vote.ngoId === req.payload.id;
              });
            })
            .map((comment) => {
              return {
                commentId: comment.id,
                voteType: comment.votes.find((vote) => {
                  return vote.userId
                    ? vote.userId === req.payload.id
                    : vote.ngoId === req.payload.id;
                })?.voteType,
              };
            }),

          commentIdsIfCommented: issue.comments
            .filter((comment) => {
              return comment.userId
                ? comment.userId === req.payload.id
                : comment.ngoId === req.payload.id;
            })
            .map((comment) => comment.id),
        },
        upVoteCount: issue.votes.filter((vote) => vote.voteType === 'UPVOTE')
          .length,
        commentsCount: issue.comments.length,
      };
    });

    res.status(200).json({
      success: true,
      data: filteredIssuesForLoggedInUser,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const issue = await getIssueById(req.params.id);

    if (!issue) {
      res.status(404);
      throw new Error('Issue not found.');
    }

    const filteredIssueForLoggedInUser = {
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

        isCommented: issue.comments.some((comment) => {
          return comment.userId
            ? comment.userId === req.payload.id
            : comment.ngoId === req.payload.id;
        }),

        isVotedInComments: issue.comments.some((comment) => {
          return comment.votes.some((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          });
        }),

        voteTypeWithCommentIfVoted: issue.comments
          .filter((comment) => {
            return comment.votes.some((vote) => {
              return vote.userId
                ? vote.userId === req.payload.id
                : vote.ngoId === req.payload.id;
            });
          })
          .map((comment) => {
            return {
              commentId: comment.id,
              voteType: comment.votes.find((vote) => {
                return vote.userId
                  ? vote.userId === req.payload.id
                  : vote.ngoId === req.payload.id;
              })?.voteType,
            };
          }),

        commentIdsIfCommented: issue.comments
          .filter((comment) => {
            return comment.userId
              ? comment.userId === req.payload.id
              : comment.ngoId === req.payload.id;
          })
          .map((comment) => comment.id),
      },
      upVoteCount: issue.votes.filter((vote) => vote.voteType == 'UPVOTE')
        .length,
      commentsCount: issue.comments.length,
    };

    res.status(200).json({
      success: true,
      data: filteredIssueForLoggedInUser,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
