const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuLoad = os.loadavg(); // [1min, 5min, 15min averages]
  const uptime = process.uptime();

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
    uptime: `${Math.floor(uptime)}s`,
    server: {
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      cpuLoad: {
        '1min': cpuLoad[0].toFixed(2),
        '5min': cpuLoad[1].toFixed(2),
        '15min': cpuLoad[2].toFixed(2),
      },
    },
    integrations: checks,
  });
});

module.exports = router;
