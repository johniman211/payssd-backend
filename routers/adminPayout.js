const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/email');
const Payout = require('../models/Payout');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ✅ GET all payouts (Admin Only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
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

// ✅ UPDATE payout status (Admin Only, with email)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Sent'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const payout = await Payout.findById(req.params.id).populate('user');
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    payout.status = status;
    await payout.save();

    // ✅ Send email if payout is approved or sent
    if (status === 'Approved' || status === 'Sent') {
      const userEmail = payout.user.email;
      const userName = payout.user.fullName || 'Merchant';
      const amount = payout.amount;
      const method = payout.method || 'your chosen method';

      await sendEmail({
        to: userEmail,
        subject: '💸 Your PaySSD Payout Has Been Approved',
        html: `<h2>Hello ${userName},</h2>
          <p>Your payout request of <strong>$${amount}</strong> has been <strong>${status.toLowerCase()}</strong> via <strong>${method}</strong>.</p>
          <p>You should receive the funds shortly.</p>
          <p>Thanks for using PaySSD.</p>`,
      });
    }

    res.json({ message: `Payout marked as ${status}`, payout });
  } catch (err) {
    console.error('❌ Error updating payout:', err.message);
    res.status(500).json({ message: 'Failed to update payout' });
  }
});

module.exports = router;
