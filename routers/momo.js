const express = require('express');
const router = express.Router();

const requiredEnv = ['MOMO_API_KEY', 'MOMO_API_URL', 'MOMO_USER'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`⚠️ MoMo env vars missing: ${missingEnv.join(', ')}. MoMo routes disabled.`);

  router.all('*', (req, res) =>
    res.status(503).json({
      success: false,
      message: 'MoMo integration disabled. Missing required environment variables.',
      missing: missingEnv,
    })
  );
} else {
  const { requestToPay } = require('../utils/momo');

  router.post('/pay', async (req, res) => {
    const {
      phone,
      amount,
      currency = 'EUR',
      externalId = 'TEST1234',
      payerMessage = 'Test payment',
    } = req.body;

    try {
      const refId = await requestToPay(phone, amount, currency, externalId, payerMessage);
      res.json({ success: true, referenceId: refId });
    } catch (err) {
      console.error('MoMo error:', err.response?.data || err.message);
      res.status(500).json({ success: false, message: 'MoMo payment failed' });
    }
  });
}

module.exports = router;
