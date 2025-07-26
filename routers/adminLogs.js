const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// Models
const AuditLog = require('../models/AuditLog');
const ErrorLog = require('../models/ErrorLog');
const LoginLog = require('../models/LoginLog');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/email');

// ✅ GET /api/admin/audit-logs
router.get(
  '/audit-logs',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
      res.json(logs);
    } catch (err) {
      console.error('❌ Failed to fetch audit logs:', err);
      res.status(500).json({ message: 'Failed to load audit logs' });
    }
  },
);

// ✅ GET /api/admin/error-logs
router.get(
  '/error-logs',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(200);
      res.json(logs);
    } catch (err) {
      console.error('❌ Failed to fetch error logs:', err);
      res.status(500).json({ message: 'Failed to load error logs' });
    }
  },
);

// ✅ GET /api/admin/login-logs
router.get(
  '/login-logs',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const logs = await LoginLog.find().sort({ createdAt: -1 }).limit(200);
      res.json(logs);
    } catch (err) {
      console.error('❌ Failed to fetch login logs:', err);
      res.status(500).json({ message: 'Failed to load login logs' });
    }
  },
);

module.exports = router;
