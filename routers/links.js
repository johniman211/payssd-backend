const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const PaymentLink = require('../models/PaymentLink');
const { authMiddleware } = require('../middleware/auth');

// ✅ Create a new payment link (requires auth)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { productName, description, amount, currency = 'SSP' } = req.body;

    if (!productName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reference = 'INV-' + uuidv4().split('-')[0].toUpperCase();

    const newLink = new PaymentLink({
      reference,
      productName,
      description,
      amount,
      currency,
      createdBy: req.user.id,
    });

    await newLink.save();

    res.status(201).json({
      message: 'Payment link created',
      reference,
      url: `http://localhost:3000/pay/${reference}`,
    });
  } catch (err) {
    console.error('❌ Create link error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get all links created by the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const links = await PaymentLink.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(links);
  } catch (err) {
    console.error('❌ Fetch links error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get a specific payment link by reference (public)
router.get('/:ref', async (req, res) => {
  try {
    const link = await PaymentLink.findOne({ reference: req.params.ref });
    if (!link) return res.status(404).json({ message: 'Link not found' });

    res.json(link);
  } catch (err) {
    console.error('❌ Fetch link error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Simulate a test payment (for sandbox/testing)
router.post('/:ref/pay', async (req, res) => {
  try {
    const link = await PaymentLink.findOne({ reference: req.params.ref });
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (link.status === 'paid') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    link.status = 'paid';
    link.paidAt = new Date();
    await link.save();

    res.json({ message: 'Payment successful', transaction: link });
  } catch (err) {
    console.error('❌ Payment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
