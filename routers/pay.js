const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Example: POST /api/pay
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, method, reference, phone } = req.body;

    if (!amount || !method || !reference || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Placeholder response
    res.json({
      message: '✅ Payment request received',
      payment: {
        reference,
        method,
        amount,
        phone,
        status: 'PENDING',
      },
    });

    // 🚀 Future: Initiate real payment with MTN, Zain, or card processor here
  } catch (err) {
    console.error('❌ Payment route error:', err.message);
    res.status(500).json({ message: 'Payment processing error' });
  }
});

module.exports = router;
