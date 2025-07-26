/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
const { setupSocket } = require('./socket');
const connectDB = require('./db'); // ✅ MongoDB helper

const app = express();
const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5001;

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Security headers
app.use(helmet());

// ✅ Stripe webhook raw body
app.use('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }));

// ✅ JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// ✅ MongoDB connection
connectDB(process.env.MONGODB_URI);

// ✅ Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// ✅ API routes
app.use('/api/auth', require('./routers/auth'));
app.use('/api/admin', require('./routers/admin'));
app.use('/api/merchant', require('./routers/merchant'));
app.use('/api/blog', require('./routers/blog'));
app.use('/api/verification', require('./routers/verification'));
app.use('/api/payout', require('./routers/payouts'));
app.use('/api/plugin', require('./routers/plugin'));
app.use('/api/newsletter', require('./routers/newsletter'));
app.use('/api/stats', require('./routers/stats'));
app.use('/api/contact', require('./routers/contact'));
app.use('/api/audit', require('./routers/audit'));
app.use('/api/payment/stripe', require('./routers/stripe'));
app.use('/api/payment/stripe', require('./routers/stripeWebhook'));
app.use('/api/admin/transactions', require('./routers/admin/transactions'));
app.use('/api/careers', require('./routers/careers'));

// ✅ Admin fallback
app.use('/api/admin', (_, res) => res.status(404).json({ message: 'Admin route not found' }));
console.log('✅ /api/admin fallback routes loaded');

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
