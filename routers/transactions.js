const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// ✅ GET /api/transactions - Fetch transactions for the logged-in merchant
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ✅ GET /api/transactions/user/:id?method=&start=&end= - Filtered by user, method, date range
router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { method, start, end } = req.query;

    const filter = { user: id };
    if (method) filter.method = method;
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Transaction fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// ✅ POST /api/transactions/create - Create a new transaction and emit via Socket.IO
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method, reference } = req.body;

    const transaction = new Transaction({
      user: userId,
      amount,
      method: method || 'MoMo',
      status: 'Success',
      reference: reference || 'txn_' + Date.now(),
      createdAt: new Date(),
    });

    const savedTransaction = await transaction.save();

    // 🔌 Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('transaction:new', {
        _id: savedTransaction._id,
        user: userId,
        amount: savedTransaction.amount,
        method: savedTransaction.method,
        status: savedTransaction.status,
        createdAt: savedTransaction.createdAt,
      });
    }

    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Transaction create error:', err);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

module.exports = router;
