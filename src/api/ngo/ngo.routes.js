const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const {
  findNgoById,
  updateNgo,
  allNGOs,
  searchNgoByName,
} = require('./ngo.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { id: ngoId } = req.payload;
    const ngo = await findNgoById(ngoId);

    if (!ngo) {
      next(new Error('Ngo not found'));
    }
    delete ngo.password;
    res.json(ngo);
  } catch (err) {
    next(err);
  }
});

router.put('/profile/update', isAuthenticated, async (req, res, next) => {
  try {
    const { id: ngoId } = req.payload;
    const ngo = await findNgoById(ngoId);

    if (!ngo) {
      next(new Error('Ngo not found'));
    }

    const updatedNgo = await updateNgo(ngoId, req.body);
    delete updatedNgo.password;
    res.json(updatedNgo);
  } catch (err) {
    next(err);
  }
});

router.get('/all', isAuthenticated, async (req, res, next) => {
  try {
    const ngos = await allNGOs();
    res.json({
      success: true,
      data: ngos.map((ngo) => {
        delete ngo.password;
        return ngo;
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', isAuthenticated, async (req, res, next) => {
  try {
    const { name } = req.query;
    const ngos = await searchNgoByName(name);
    res.json({
      success: true,
      data: ngos.map((ngo) => {
        const filteredPostsForLoggedInUser = ngo.createdPosts.map((post) => {
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
        const filteredCampaignsForLoggedInUser = ngo.createdCampaigns.map(
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
        const filteredIssuesForLoggedInUser = ngo.createdIssues.map((issue) => {
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
        });
        delete ngo.password;
        return {
          ...ngo,
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
