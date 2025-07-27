const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const requiredEnv = ['MTN_API_KEY', 'ZAIN_API_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`⚠️ Payment env vars missing: ${missingEnv.join(', ')}. Payment routes disabled.`);

  router.all('*', (req, res) =>
    res.status(503).json({
      message: 'Payment integration disabled. Missing required environment variables.',
      missing: missingEnv,
    })
  );
} else {
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { amount, method, reference, phone } = req.body;

      if (!amount || !method || !reference || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      res.json({
        message: '✅ Payment request received',
        payment: { reference, method, amount, phone, status: 'PENDING' },
      });

      // 🚀 Future: Initiate real payment integration here
    } catch (err) {
      console.error('❌ Payment route error:', err.message);
      res.status(500).json({ message: 'Payment processing error' });
    }
  });
}

module.exports = router;
