const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats/admin
router.get('/admin', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const transactions = await Transaction.find();
    const users = await User.find();

    const totalRevenue = transactions
      .filter((tx) => tx.status === 'Success')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalUsers = users.length;
    const totalMerchants = users.filter((u) => u.role === 'merchant').length;

    const chartMap = new Map();
    users.forEach((u) => {
      const day = u.createdAt.toISOString().slice(0, 10);
      chartMap.set(day, (chartMap.get(day) || 0) + 1);
    });

    const chart = [...chartMap.entries()]
      .map(([label, users]) => ({ label, users }))
      .sort((a, b) => new Date(a.label) - new Date(b.label));

    res.json({ totalRevenue, totalUsers, totalMerchants, chart });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
