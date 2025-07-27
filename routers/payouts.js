const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const { authMiddleware } = require('../middleware/auth');

const requiredEnv = ['PAYOUT_API_KEY', 'PAYOUT_API_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`⚠️ Payout env vars missing: ${missingEnv.join(', ')}. Payout routes disabled.`);

  router.all('*', (req, res) =>
    res.status(503).json({
      message: 'Payout integration disabled. Missing required environment variables.',
      missing: missingEnv,
    })
  );
} else {
  router.post('/request', authMiddleware, async (req, res) => {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
      const newPayout = new Payout({
        user: req.user._id,
        amount,
        method: method || 'momo',
        status: 'pending',
      });

      await newPayout.save();
      res.status(201).json({ message: 'Payout request submitted successfully', payout: newPayout });
    } catch (err) {
      console.error('❌ Failed to create payout:', err.message);
      res.status(500).json({ message: 'Failed to create payout request' });
    }
  });

  router.get('/', authMiddleware, async (req, res) => {
    try {
      const payouts = await Payout.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(payouts);
    } catch (err) {
      console.error('❌ Failed to fetch payouts:', err.message);
      res.status(500).json({ message: 'Failed to fetch payouts' });
    }
  });
}

module.exports = router;
