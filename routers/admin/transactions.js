const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// 🔐 Only admin can access
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error('❌ Failed to fetch payments:', err);
    res.status(500).json({ message: 'Failed to load transactions' });
  }
});

module.exports = router;
