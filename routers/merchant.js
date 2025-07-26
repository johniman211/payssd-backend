const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('express-rate-limit');

// 🔒 Rate limiter: Max 1 API key regen per minute
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: 'Too many API key regenerations. Please wait a minute.',
});

// ✅ GET /api/merchant/profile — full profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const merchant = await User.findById(req.user._id);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });

    res.json({
      name: merchant.name,
      email: merchant.email,
      mobile: merchant.mobile,
      businessName: merchant.businessName,
      apiKey: merchant.apiKey || '',
    });

    await AuditLog.create({
      user: merchant._id,
      action: 'View Profile',
      details: 'Merchant profile viewed with API key',
      status: 'Success',
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/merchant/me — alias to /profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const merchant = await User.findById(req.user._id);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });

    res.json({
      name: merchant.name,
      email: merchant.email,
      mobile: merchant.mobile,
      businessName: merchant.businessName,
      apiKey: merchant.apiKey || '',
    });

    await AuditLog.create({
      user: merchant._id,
      action: 'Load /me',
      details: 'Fetched merchant via /me endpoint',
      status: 'Success',
    });
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/merchant/api-key
router.get('/api-key', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ apiKey: user.apiKey || '' });

    await AuditLog.create({
      user: user._id,
      action: 'View API Key',
      details: 'Merchant viewed their API key',
      status: 'Success',
    });
  } catch (err) {
    console.error('Failed to fetch API key:', err);
    res.status(500).json({ message: 'Failed to fetch API key' });
  }
});

// ✅ POST /api/merchant/api-key/regenerate
router.post(
  '/api-key/regenerate',
  authMiddleware,
  apiKeyLimiter,
  async (req, res) => {
    try {
      const newKey = crypto.randomBytes(24).toString('hex');

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { apiKey: newKey },
        { new: true },
      );

      // Send email alert (optional)
      if (user.email) {
        await sendEmail(
          user.email,
          '🔑 API Key Regenerated',
          `
        <p>Hello ${user.name || 'Merchant'},</p>
        <p>Your new API key was generated at ${new Date().toLocaleString()}.</p>
        <p>If this was not you, please contact PaySSD support immediately.</p>
      `,
        );
      }

      await AuditLog.create({
        user: user._id,
        action: 'Regenerate API Key',
        details: 'Merchant regenerated their API key',
        status: 'Success',
      });

      res.json({ apiKey: user.apiKey });
    } catch (err) {
      console.error('Failed to regenerate API key:', err);
      res.status(500).json({ message: 'Failed to regenerate API key' });
    }
  },
);

// ✅ GET /api/merchant/test-connection — WooCommerce plugin test
router.get('/test-connection', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.apiKey) {
      return res.status(400).json({ error: 'API key not found' });
    }

    res.json({ success: true, message: 'Plugin connected successfully' });

    await AuditLog.create({
      user: user._id,
      action: 'Test Plugin Connection',
      details: 'WooCommerce plugin tested connection',
      status: 'Success',
    });
  } catch (err) {
    console.error('Test connection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
