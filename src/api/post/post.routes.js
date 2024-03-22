const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('../user/user.services');
const { Role } = require('@prisma/client');
const { createPost, allPosts, findPostById } = require('./post.services');
const postVote = require('./vote/vote.routes');
const postComment = require('./comment/comment.routes');
const { findNgoById } = require('../ngo/ngo.services');
const {
  addMediaToS3,
  deleteMediaFromS3,
  getMediaFromS3,
} = require('../../utils/s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use('/vote', postVote);
router.use('/comment', postComment);

router.post('/create/user', isAuthenticated, async (req, res, next) => {
  const mediaAvailable = req.files && req.files.length > 0;

  let mKeys = [];

  try {
    const { title, description, address, tags } = req.body;

    if (!title || !description || !mediaAvailable) {
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
      const key = `post/user/${userId}/${mediaName}`;

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

    const post = await createPost({
      title,
      description,
      address: JSON.parse(address),
      tags: JSON.parse(tags),
      ownUserId: userId,
      media: mediaFiles,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    await mKeys.forEach(async (key) => {
      await deleteMediaFromS3(key);
    });
    console.log(err);
    next(err);
  }
});

router.post('/create/ngo', isAuthenticated, async (req, res, next) => {
  const mediaAvailable = req.files && req.files.length > 0;

  let mKeys = [];

  try {
    const { title, description, address, tags } = req.body;

    if (!title || !description || !mediaAvailable) {
      res.status(400);
      throw new Error('You must provide all the required fields.');
    }

    const { id: ngoId } = req.payload;

    const ngoExist = await findNgoById(ngoId);

    if (!ngoExist || ngoExist?.role !== Role.NGO) {
      res.status(404);
      throw new Error('Ngo not found or not authorized.');
    }

    // Upload media files asynchronously and collect promises
    const uploadPromises = req.files.map(async (media) => {
      const mediaName = `${uuidv4()}.${media.originalname.split('.').pop()}`;
      const key = `post/ngo/${ngoId}/${mediaName}`;

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

    const post = await createPost({
      title,
      description,
      address: JSON.parse(address),
      tags: JSON.parse(tags),
      ownNgoId: ngoId,
      media: mediaFiles,
    });

    res.status(201).json({
      success: true,
      data: post,
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

          isCommented: post.comments.some((comment) => {
            return comment.userId
              ? comment.userId === req.payload.id
              : comment.ngoId === req.payload.id;
          }),

          isVotedInComments: post.comments.some((comment) => {
            return comment.votes.some((vote) => {
              return vote.userId
                ? vote.userId === req.payload.id
                : vote.ngoId === req.payload.id;
            });
          }),

          voteTypeWithCommentIfVoted: post.comments
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

          commentIdsIfCommented: post.comments
            .filter((comment) => {
              return comment.userId
                ? comment.userId === req.payload.id
                : comment.ngoId === req.payload.id;
            })
            .map((comment) => comment.id),
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

router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await findPostById(id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found.');
    }

    const filteredPostForLoggedInUser = {
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

        isCommented: post.comments.some((comment) => {
          return comment.userId
            ? comment.userId === req.payload.id
            : comment.ngoId === req.payload.id;
        }),

        isVotedInComments: post.comments.some((comment) => {
          return comment.votes.some((vote) => {
            return vote.userId
              ? vote.userId === req.payload.id
              : vote.ngoId === req.payload.id;
          });
        }),

        voteTypeWithCommentIfVoted: post.comments
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

        commentIdsIfCommented: post.comments
          .filter((comment) => {
            return comment.userId
              ? comment.userId === req.payload.id
              : comment.ngoId === req.payload.id;
          })
          .map((comment) => comment.id),
      },

      upVoteCount: post.votes.filter((vote) => vote.voteType === 'UPVOTE')
        .length,

      commentsCount: post.comments.length,
    };

    res.json({
      success: true,
      data: filteredPostForLoggedInUser,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
