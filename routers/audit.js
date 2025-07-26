const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/audit (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error('❌ Failed to load audit logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
