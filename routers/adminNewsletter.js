const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/email');
const Newsletter = require('../models/Newsletter');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ✅ GET: All Newsletter Subscribers (Admin)
router.get(
  '/subscribers',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const list = await Newsletter.find().sort({ createdAt: -1 });
      res.json(list);
    } catch (err) {
      console.error('❌ Failed to load subscribers:', err.message);
      res.status(500).json({ message: 'Failed to load subscribers' });
    }
  },
);

// ✅ POST: Send newsletter to all subscribers (Admin)
router.post('/send', authMiddleware, requireRole('admin'), async (req, res) => {
  const { subject, content } = req.body;

  try {
    const subscribers = await Newsletter.find();

    if (!subscribers.length) {
      return res.status(400).json({ message: 'No subscribers found' });
    }

    const promises = subscribers.map((subscriber) =>
      sendEmail({
        to: subscriber.email,
        subject: subject || '📰 New from PaySSD',
        html: `
          <h2>Hello!</h2>
          <p>${content}</p>
          <hr />
          <p style="font-size:12px; color:gray;">You received this because you're subscribed to PaySSD updates.</p>
        `,
      }),
    );

    await Promise.all(promises);

    res.json({ message: `✅ Newsletter sent to ${subscribers.length} users` });
  } catch (err) {
    console.error('❌ Newsletter send failed:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
