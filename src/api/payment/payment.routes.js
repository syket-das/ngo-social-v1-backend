const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post(
  '/create-payment-intent/campaign',
  isAuthenticated,

  async (req, res, next) => {
    const { amount, campaignId } = req.body;

    const { id, role } = req.payload;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'inr',
        automatic_payment_methods: {
          enabled: true,
        },

        metadata: {
          donorId: id,
          donorRole: role,
          campaignId: campaignId,
        },
      });

      return res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
