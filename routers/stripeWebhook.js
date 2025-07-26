const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const Payment = require('../models/Payment'); // create this model below
const sendEmail = require('../utils/sendEmail'); // uses nodemailer

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { amount_total, customer_email, metadata } = session;

    // 1. Save to DB
    await Payment.create({
      email: customer_email,
      amount: amount_total / 100,
      method: 'card',
      ref: session.client_reference_id || 'N/A',
      status: 'success',
    });

    // 2. Email receipt
    await sendEmail({
      to: customer_email,
      subject: 'Your PaySSD Payment Receipt',
      html: `<p>Thank you for your payment of $${amount_total / 100}.</p><p>Reference: ${session.client_reference_id}</p>`,
    });
  }

  res.json({ received: true });
});

module.exports = router;
