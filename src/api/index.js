const express = require('express');
const multer = require('multer');
const auth = require('./auth/auth.routes');
const user = require('./user/user.routes');
const ngo = require('./ngo/ngo.routes');
const post = require('./post/post.routes');
const issue = require('./issue/issue.routes');
const campaign = require('./campaign/campaign.routes');
const notification = require('./notification/notification.routes');
const payment = require('./payment/payment.routes');

const { addMediaToS3, getMediaFromS3 } = require('../utils/s3');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);
router.use('/user', upload.array('media'), user);
router.use('/ngo', upload.array('media'), ngo);
router.use('/post', post);
router.use('/issue', issue);
router.use('/campaign', campaign);
router.use('/notification', notification);
router.use('/payment', payment);

module.exports = router;
