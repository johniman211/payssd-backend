const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const User = require('../models/User');

// ✅ GET current API key with logs
router.get(
  '/api-key',
  authMiddleware,
  requireRole('merchant'),
  async (req, res) => {
    console.log('🧪 GET /api-key triggered by:', req.user?.id);
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        console.log('❌ No user found');
        return res.status(404).json({ message: 'User not found' });
      }
      console.log('✅ Found user:', user.email, 'API Key:', user.apiKey);
      res.json({ apiKey: user.apiKey || '' });
    } catch (err) {
      console.error('❌ Error in /api-key:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ✅ POST generate/regenerate API key
router.post(
  '/api-key/regenerate',
  authMiddleware,
  requireRole('merchant'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.apiKey = crypto.randomBytes(32).toString('hex');
      await user.save();

      console.log('🔁 Regenerated API Key for:', user.email);
      res.json({ apiKey: user.apiKey });
    } catch (err) {
      console.error('❌ Failed to regenerate API key:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

module.exports = router;
