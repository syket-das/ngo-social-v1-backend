const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  findUserById,
  updateUser,
  allUsers,
  allMaintainers,
  searchUserByFullName,
} = require('./user.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;
    const user = await findUserById(userId);

    if (!user) {
      next(new Error('User not found'));
    }
    delete user.password;
    res.json({
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/profile/update', isAuthenticated, async (req, res, next) => {
  try {
    const { id: userId } = req.payload;
    const { fullName, bio, profession, interests, phone, address } = req.body;

    const user = await updateUser(userId, {
      fullName,
      phone,
      address,

      bio: bio,
      profession: profession,
      interests: interests,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const users = await allUsers();
    res.json({
      success: true,
      data: users.map((user) => {
        delete user.password;
        return user;
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', isAuthenticated, async (req, res, next) => {
  try {
    const fullName = req.query.fullName;

    const users = await searchUserByFullName(fullName);

    res.json({
      success: true,
      data: users.map((user) => {
        const filteredPostsForLoggedInUser = user.createdPosts.map((post) => {
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

        const filteredCampaignsForLoggedInUser = user.createdCampaigns.map(
          (campaign) => {
            return {
              ...campaign,
              loggedInUserOrNgoDetailsForCampaign: {
                isOwner:
                  campaign.ownUserId === req.payload.id
                    ? true
                    : campaign.ownNgoId === req.payload.id
                    ? true
                    : false,
                isJoined: campaign.joinedUsers?.some(
                  (user) => user.id === req.payload.id
                )
                  ? true
                  : campaign.joinedNgos?.some(
                      (ngo) => ngo.id === req.payload.id
                    )
                  ? true
                  : false,
              },
            };
          }
        );

        const filteredIssuesForLoggedInUser = user.createdIssues.map(
          (issue) => {
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
              upVoteCount: issue.votes.filter(
                (vote) => vote.voteType === 'UPVOTE'
              ).length,
              commentsCount: issue.comments.length,
            };
          }
        );

        delete user.password;
        return {
          ...user,
          createdPosts: filteredPostsForLoggedInUser,
          createdCampaigns: filteredCampaignsForLoggedInUser,
          createdIssues: filteredIssuesForLoggedInUser,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
