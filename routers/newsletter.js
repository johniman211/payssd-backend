const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/email'); // ✅ Email utility

// 📁 Ensure backup folder exists
const filePath = path.join(__dirname, '..', 'data', 'newsletter.txt');
fs.mkdirSync(path.dirname(filePath), { recursive: true });

// ✅ POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    // 🔍 Check if already subscribed
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email is already subscribed.' });
    }

    // 💾 Save to MongoDB
    const newSub = new Newsletter({ email });
    await newSub.save();

    // 📁 Backup to text file
    fs.appendFileSync(filePath, `${email}\n`);

    // 📧 Send welcome email
    await sendEmail({
      to: email,
      subject: '🎉 Welcome to PaySSD News & Updates',
      html: `
        <h2>You're now subscribed!</h2>
        <p>Thank you for subscribing to PaySSD. We'll send you updates, new feature announcements, and important news.</p>
        <p>Want to learn more? Visit <a href="https://payssd.com">PaySSD.com</a></p>
      `,
    });

    res.json({ message: 'Subscribed and confirmation email sent.' });
  } catch (err) {
    console.error('❌ Newsletter subscribe error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
