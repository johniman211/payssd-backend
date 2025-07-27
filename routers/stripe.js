const express = require('express');
const router = express.Router();

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('⚠️ STRIPE_SECRET_KEY is not set. Stripe endpoints are disabled.');

  // Return a clear error for all stripe routes if no key
  router.all('*', (req, res) => {
    return res.status(503).json({
      message: 'Stripe integration is disabled. Missing STRIPE_SECRET_KEY.',
    });
  });
} else {
  const stripe = require('stripe')(stripeKey);

  // Example route: create a payment intent
  router.post('/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'usd' } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error('Stripe error:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = router;
