const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ✅ Create SMTP transporter (Brevo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'support@payssd.com',
    pass: process.env.SMTP_PASS || '+211JOHNNINNI.com/shameless',
  },
});

// ✅ Send email function with logging and fallback
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'PaySSD <support@payssd.com>',
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ''), // Fallback text
      attachments,
    });

    console.log('📧 Email sent:', info.messageId);

    // Optional log to file
    const logPath = path.join(__dirname, '../logs/email.log');
    const logEntry = `${new Date().toISOString()} | To: ${to} | Subject: ${subject} | Status: Sent\n`;
    fs.appendFileSync(logPath, logEntry);

    return info;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    const logPath = path.join(__dirname, '../logs/email.log');
    const logEntry = `${new Date().toISOString()} | To: ${to} | Subject: ${subject} | Status: Failed | Error: ${error.message}\n`;
    fs.appendFileSync(logPath, logEntry);
    throw error;
  }
};

module.exports = { transporter, sendEmail };
