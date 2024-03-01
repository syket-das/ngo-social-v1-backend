const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const middlewares = require('./middlewares');
const api = require('./api');
const { createTransaction } = require('./api/payment/payment.services');

const app = express();

const endpointSecret =
  'whsec_c5a6a75ecfd1a5c35ff5303f7b105b9e65e97a8e98359cf273d5e9b9d08e9ee6';

app.post(
  '/api/v1/payment/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await createTransaction({
          amount: paymentIntent.amount / 100,
          donorId: paymentIntent.metadata.donorId,
          donorRole: paymentIntent.metadata.donorRole,
          campaignId: paymentIntent.metadata.campaignId || undefined,
          fundRaisingId: paymentIntent.metadata.fundRaisingId || undefined,
          status: 'SUCCESS',
          gatewayTransactionId: paymentIntent.id,
          gatewayTransaction: paymentIntent,
        });
      }
    } catch (err) {
      console.log(err);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Return a 200 response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
