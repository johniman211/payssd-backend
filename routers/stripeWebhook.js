const express = require('express');
const router = express.Router();

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('⚠️ STRIPE_SECRET_KEY not set. Stripe Webhook disabled.');

  router.all('*', (req, res) =>
    res.status(503).json({
      message: 'Stripe webhook disabled. Missing STRIPE_SECRET_KEY.',
    })
  );
} else {
  const stripe = require('stripe')(stripeKey);

  // Example webhook endpoint
  router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle event type
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment successful:', event.data.object.id);
          break;
        // add more event types as needed
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });
}

module.exports = router;
