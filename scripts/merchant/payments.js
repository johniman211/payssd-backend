const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// 🔐 Only for merchants
router.get('/', authMiddleware, requireRole('merchant'), async (req, res) => {
  try {
    const email = req.user.email;
    const payments = await Payment.find({ email }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error('❌ Failed to fetch merchant payments:', err);
    res.status(500).json({ message: 'Failed to load your payments' });
  }
});

module.exports = router;
