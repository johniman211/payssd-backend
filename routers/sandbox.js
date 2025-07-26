// backend/routers/sandbox.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// ✅ Simulate test payment (already added above)
router.post('/test/payment', (req, res) => {
  const fakeTransaction = {
    id: 'txn_test_' + Date.now(),
    amount: req.body.amount || 1500,
    currency: req.body.currency || 'SSP',
    status: 'success',
    description: req.body.description || 'Test payment',
    createdAt: new Date(),
  };

  res.json({ message: 'Test payment processed', transaction: fakeTransaction });
});

// ✅ Simulate Verification Approval
router.post('/test/Verification-approve', authMiddleware, (req, res) => {
  const userId = req.user.id;
  // This would normally update DB status to "approved"
  res.json({
    message: `✅ Verification for user ${userId} marked as approved.`,
  });
});

// ✅ Simulate Verification Rejection
router.post('/test/Verification-reject', authMiddleware, (req, res) => {
  const userId = req.user.id;
  // This would normally update DB status to "rejected"
  res.json({
    message: `❌ Verification for user ${userId} marked as rejected.`,
  });
});

module.exports = router;
