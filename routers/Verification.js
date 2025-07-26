const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Verification = require('../models/Verification');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// 📥 Submit Verification
router.post(
  '/submit',
  authMiddleware,
  upload.fields([
    { name: 'nationalIdFile' },
    { name: 'passportFile' },
    { name: 'selfieWithId' },
    { name: 'businessLicenseFile' },
    { name: 'bankStatement' },
    { name: 'businessPhoto' },
  ]),
  async (req, res) => {
    try {
      const existing = await Verification.findOne({ user: req.user._id });
      if (existing)
        return res
          .status(400)
          .json({ message: 'You already submitted verification.' });

      const newVerification = new Verification({
        user: req.user._id,
        ...req.body,
        nationalIdFile: req.files.nationalIdFile?.[0]?.filename || '',
        passportFile: req.files.passportFile?.[0]?.filename || '',
        selfieWithId: req.files.selfieWithId?.[0]?.filename || '',
        businessLicenseFile: req.files.businessLicenseFile?.[0]?.filename || '',
        bankStatement: req.files.bankStatement?.[0]?.filename || '',
        businessPhoto: req.files.businessPhoto?.[0]?.filename || '',
        status: 'pending',
      });

      await newVerification.save();
      res
        .status(201)
        .json({
          message: 'Verification submitted successfully',
          id: newVerification._id,
        });
    } catch (err) {
      console.error('❌ Verification error:', err);
      res.status(500).json({ message: 'Verification submission failed' });
    }
  },
);

// 📤 Get Current User's Verification
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const verification = await Verification.findOne({ user: req.user._id });
    res.json(verification || {});
  } catch (err) {
    console.error('❌ Failed to get user verification:', err);
    res.status(500).json({ message: 'Failed to load verification' });
  }
});

// 📋 Admin: Get All Verifications
router.get('/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const verifications = await Verification.find().populate(
      'user',
      'name email',
    );
    res.json(verifications);
  } catch (err) {
    console.error('❌ Failed to fetch verifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: Approve or Reject Verification
router.put(
  '/:id/status',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Invalid status. Use "approved" or "rejected".' });
    }

    try {
      const verification = await Verification.findById(req.params.id);
      if (!verification)
        return res.status(404).json({ message: 'Verification not found' });

      verification.status = status;
      await verification.save();

      res.json({ message: `Verification ${status}` });
    } catch (err) {
      console.error('❌ Error updating verification status:', err);
      res.status(500).json({ message: 'Failed to update verification' });
    }
  },
);

module.exports = router;
