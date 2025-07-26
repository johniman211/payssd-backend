const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const Job = require('../models/Job');
const Application = require('../models/Application');
const { sendEmail } = require('../utils/email'); // nodemailer wrapper

// ✅ Set up file upload for CVs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/resumes');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch {
    res.status(500).json({ message: 'Failed to load jobs' });
  }
});

// ✅ POST a new job (admin only)
router.post('/', async (req, res) => {
  const { title, description, type, location } = req.body;

  try {
    const newJob = await Job.create({ title, description, type, location });
    res.json({ message: 'Job posted', job: newJob });
  } catch {
    res.status(500).json({ message: 'Failed to post job' });
  }
});

// ✅ POST job application with CV upload + email + DB
router.post('/apply', upload.single('cv'), async (req, res) => {
  const { name, email, jobId, message } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'CV upload required' });
  }

  try {
    // ✅ Save application to MongoDB
    await Application.create({
      name,
      email,
      message,
      jobId,
      cvFile: req.file.filename,
    });

    // ✅ Notify admin with CV attachment
    await sendEmail({
      to: 'careers@payssd.com',
      subject: `New Job Application: ${name}`,
      html: `
        <p><strong>Applicant:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <p><strong>CV attached.</strong></p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    });

    // ✅ Send confirmation email to applicant
    await sendEmail({
      to: email,
      subject: '✅ Your Application to PaySSD',
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for applying for a role at <strong>PaySSD</strong>. We've received your application and our team will review it shortly.</p>
        <p>If shortlisted, we’ll get in touch via email.</p>
        <br/>
        <p>Best,<br/>PaySSD Careers Team</p>
      `,
    });

    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('❌ Application error:', err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

module.exports = router;
