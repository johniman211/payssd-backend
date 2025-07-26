const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats/summary (Merchant Dashboard)
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId });
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTransactions = transactions.length;

    const pendingPayouts = await Payout.countDocuments({
      user: userId,
      status: 'Pending',
    });

    // Daily totals for chart
    const chartMap = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt).toISOString().slice(0, 10);
      chartMap[date] = (chartMap[date] || 0) + tx.amount;
    });
    const chart = Object.entries(chartMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, total]) => ({ date, total }));

    // Payment method breakdown
    const breakdown = {
      MoMo: transactions
        .filter((tx) => tx.type === 'MoMo')
        .reduce((sum, tx) => sum + tx.amount, 0),
      Card: transactions
        .filter((tx) => tx.type === 'Card')
        .reduce((sum, tx) => sum + tx.amount, 0),
    };

    res.json({
      totalRevenue,
      totalTransactions,
      pendingPayouts,
      chart,
      breakdown,
    });
  } catch (err) {
    console.error('❌ Summary fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// GET /api/stats/revenue-trends (Admin or Global Charts)
router.get('/revenue-trends', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: require('mongoose').Types.ObjectId(userId),
          status: 'Success',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formatted = trends.map((entry) => ({
      date: entry._id,
      amount: entry.totalAmount,
    }));

    res.json({ revenue: formatted });
  } catch (err) {
    console.error('❌ Revenue trend error:', err);
    res.status(500).json({ error: 'Failed to load revenue trends' });
  }
});

module.exports = router;
