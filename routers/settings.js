const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Setting = require('../models/Setting'); // You’ll create this model

router.post('/update', auth, async (req, res) => {
  try {
    const { smtp, payoutLimit, password } = req.body;

    // Only one settings doc, or upsert
    await Setting.findOneAndUpdate(
      {},
      { smtp, payoutLimit, password },
      { upsert: true, new: true },
    );

    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
