const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const User = require('../models/User');

// ✅ GET /api/admin/merchants - List all merchants (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const merchants = await User.find({ role: 'merchant' }).select(
      'fullName email mobile emailVerified kycStatus createdAt',
    );
    res.json(merchants);
  } catch (err) {
    console.error('❌ Failed to fetch merchants:', err.message);
    res.status(500).json({ message: 'Error fetching merchants' });
  }
});

// ✅ POST /api/admin/merchants/status/:id - Update merchant status (admin only)
router.post(
  '/status/:id',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    const { status } = req.body;
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.status = status;
      await user.save();

      res.json({ message: 'Status updated', user });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update status' });
    }
  },
);

module.exports = router;
