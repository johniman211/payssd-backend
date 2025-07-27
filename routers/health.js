const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const checks = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    momo: !!(process.env.MOMO_API_KEY && process.env.MOMO_API_URL && process.env.MOMO_USER),
    pay: !!(process.env.MTN_API_KEY && process.env.ZAIN_API_KEY),
    payouts: !!(process.env.PAYOUT_API_KEY && process.env.PAYOUT_API_URL),
    email: !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
    ),
    database: !!process.env.MONGODB_URI,
  };

  res.json({
    status: 'ok',
    timestamp: new Date(),
    integrations: checks,
  });
});

module.exports = router;
