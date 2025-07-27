// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json());

// CORS handling
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Not Allowed'));
      }
    },
    credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- Routes --- //
app.get('/', (req, res) => {
  res.json({ message: 'PaySSD Backend Running' });
});

app.use('/api/auth', require('./routers/auth'));
app.use('/api/admin', require('./routers/admin'));
app.use('/api/admin/logs', require('./routers/adminLogs'));
app.use('/api/admin/payout', require('./routers/adminPayout'));
app.use('/api/admin/settings', require('./routers/adminSettings'));
app.use('/api/admin/stats', require('./routers/adminStats'));
app.use('/api/admin/merchants', require('./routers/adminMerchants'));
app.use('/api/admin/newsletter', require('./routers/adminNewsletter'));
app.use('/api/admin/blog', require('./routers/adminBlog'));
app.use('/api/admin/careers', require('./routers/careers'));

app.use('/api/pay', require('./routers/pay'));
app.use('/api/stripe', require('./routers/stripe'));
app.use('/api/momo', require('./routers/momo'));
app.use('/api/payments', require('./routers/payments'));
app.use('/api/payouts', require('./routers/payouts'));
app.use('/api/transactions', require('./routers/transactions'));
app.use('/api/plugin', require('./routers/plugin'));
app.use('/api/links', require('./routers/links'));
app.use('/api/merchant/apikey', require('./routers/merchantApiKey'));
app.use('/api/merchant', require('./routers/merchant'));
app.use('/api/newsletter', require('./routers/newsletter'));
app.use('/api/blog', require('./routers/blog'));
app.use('/api/public/blog', require('./routers/publicBlog'));
app.use('/api/contact', require('./routers/contact'));
app.use('/api/settings', require('./routers/settings'));
app.use('/api/logs', require('./routers/logs'));
app.use('/api/stats', require('./routers/stats'));
app.use('/api/sandbox', require('./routers/sandbox'));
app.use('/api/stripe/webhook', require('./routers/stripeWebhook'));
app.use('/api/audit', require('./routers/audit'));

// FIX: Case-sensitive route import
app.use('/api/verification', require('./routers/verification'));

// Stripe example endpoint
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
app.post('/api/charge', async (req, res) => {
  try {
    const { amount, source } = req.body;
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source,
      description: 'Test charge',
    });
    res.json(charge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
