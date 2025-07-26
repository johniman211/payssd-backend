const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ✅ GET /api/logs/errors
router.get(
  '/errors',
  authMiddleware,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const logs = await ErrorLog.find()
        .sort({ createdAt: -1 })
        .populate('user', 'email');
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching error logs' });
    }
  },
);

module.exports = router;
