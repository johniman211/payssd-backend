const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment'); // We'll create this model
const { authMiddleware } = require('../middleware/auth');

// Mock card payment (simulated)
router.post('/card', authMiddleware, async (req, res) => {
  const { amount, cardNumber, expiry, cvv, nameOnCard } = req.body;

  try {
    // You can add real payment processor integration here later
    const newPayment = new Payment({
      user: req.user.id,
      type: 'Card',
      amount,
      status: 'Success',
      reference: 'CARD-' + Date.now(),
      methodDetails: { nameOnCard, cardNumber, expiry },
    });

    await newPayment.save();

    res.json({
      success: true,
      message: 'Payment successful',
      payment: newPayment,
    });
  } catch (err) {
    console.error('Card payment error:', err);
    res.status(500).json({ success: false, message: 'Payment failed' });
  }
});

module.exports = router;
