const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // ✅ fixed import

const Setting = require('../models/Setting');

// ✅ Update settings route (protected)
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { smtp, payoutLimit, password } = req.body;

    await Setting.findOneAndUpdate(
      {},
      { smtp, payoutLimit, password },
      { upsert: true, new: true }
    );

    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
