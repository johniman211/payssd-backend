const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../utils/email');

const ADMIN_EMAIL = 'johnnyafrica211@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'PaySSD <support@payssd.com>';

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Save message to DB
    await ContactMessage.create({ name, email, subject, message });

    // ✅ 1. Notify Admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `📨 New Contact Message: ${subject}`,
      html: `
        <h2>📬 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    // ✅ 2. Confirm to Sender
    await sendEmail({
      to: email,
      subject: '✅ We received your message at PaySSD',
      html: `
        <h2>Thank you, ${name}!</h2>
        <p>We've received your message and our team will get back to you shortly.</p>
        <hr/>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>— PaySSD Support Team</p>
      `,
    });

    res.json({ message: 'Your message has been sent!' });
  } catch (err) {
    console.error('❌ Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
