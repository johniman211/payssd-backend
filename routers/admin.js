const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// 🧠 Models
const Payout = require('../models/Payout');
const User = require('../models/User');
const Verification = require('../models/Verification');
const Transaction = require('../models/Transaction');
const Application = require('../models/Application');
const Job = require('../models/Job');

// 📧 Email utility
const sendEmail = require('../utils/email');

/**
 * ============================
 * PAYOUT ROUTES
 * ============================
 */

// ✅ Admin View: All Payout Requests
router.get('/payouts', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (err) {
    console.error('❌ Error fetching payouts:', err.message);
    res.status(500).json({ message: 'Failed to fetch payouts' });
  }
});

// ✅ Update Payout Status (Approve/Reject)
router.put('/payouts/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const payout = await Payout.findByIdAndUpdate(id, { status }, { new: true });
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  } catch (err) {
    console.error('❌ Failed to update payout status:', err.message);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

/**
 * ============================
 * VERIFICATION ROUTES
 * ============================
 */

// ✅ Admin View: All Verifications
router.get('/verifications', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const verifications = await Verification.find().populate('user', 'fullName email phone');
    res.json(verifications);
  } catch (err) {
    console.error('❌ Error fetching verifications:', err.message);
    res.status(500).json({ message: 'Failed to fetch verifications' });
  }
});

// ✅ Update Verification Status
router.put('/verification/update/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const verification = await Verification.findByIdAndUpdate(id, { status }, { new: true }).populate('user');

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    if (status === 'approved') {
      const userEmail = verification.user.email;
      const userName = verification.user.fullName || 'Merchant';

      await sendEmail({
        to: userEmail,
        subject: '✅ Your PaySSD Verification is Approved',
        html: `<h2>Hello ${userName},</h2>
               <p>Your verification request has been approved. You now have full access to PaySSD's merchant features.</p>
               <p><strong>Login now:</strong> <a href="https://payssd.com/dashboard">PaySSD Dashboard</a></p>
               <p>Thank you for using PaySSD.</p>`,
      });
    }

    res.json({ message: 'Status updated', verification });
  } catch (err) {
    console.error('❌ Failed to update verification status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ============================
 * MERCHANT ROUTES
 * ============================
 */

// ✅ View All Merchants
router.get('/merchants', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const merchants = await User.find({ role: 'merchant' }).select('-password');
    res.json(merchants);
  } catch (err) {
    console.error('❌ Error fetching merchants:', err.message);
    res.status(500).json({ message: 'Failed to fetch merchants' });
  }
});

/**
 * ============================
 * DASHBOARD SUMMARY
 * ============================
 */

router.get('/summary', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const merchants = await User.countDocuments({ role: 'merchant' });
    const transactions = await Transaction.find();
    const totalTransactions = transactions.length;
    const revenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const pending = await Verification.countDocuments({ status: 'pending' });

    res.json({
      stats: {
        merchants,
        transactions: totalTransactions,
        revenue,
        pending,
      },
    });
  } catch (err) {
    console.error('❌ Failed to load summary:', err.message);
    res.status(500).json({ message: 'Failed to load summary' });
  }
});

/**
 * ============================
 * JOB APPLICATION ROUTES
 * ============================
 */

// ✅ View All Job Applications
router.get('/applications', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .populate('jobId', 'title');

    res.json(applications);
  } catch (err) {
    console.error('❌ Failed to load applications:', err.message);
    res.status(500).json({ message: 'Failed to load applications' });
  }
});

// ✅ Delete an Application
router.delete('/applications/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ✅ Email Reply to Applicant
router.post('/applications/reply', authMiddleware, requireRole('admin'), async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    await sendEmail({
      to: email,
      subject,
      html: `<p>${message}</p><br/><p>– PaySSD Careers Team</p>`,
    });

    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    console.error('❌ Failed to send reply:', err.message);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;
