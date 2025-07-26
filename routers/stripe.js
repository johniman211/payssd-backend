// backend/routers/stripe.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Loaded from .env

// 🧾 Create a Stripe Checkout session
router.post('/create-session', async (req, res) => {
  const { amount, email, ref } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount * 100, // amount in cents
            product_data: {
              name: `PaySSD Invoice #${ref}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `http://localhost:3000/success?ref=${ref}`,
      cancel_url: `http://localhost:3000/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
