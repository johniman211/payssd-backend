// backend/scripts/repairPayoutUserLinks.js
require('dotenv').config();
const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;

const fix = async () => {
  try {
    console.log('⏳ Connecting...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    const payouts = await Payout.find().lean();

    for (const payout of payouts) {
      if (typeof payout.user === 'string') {
        const user = await User.findById(payout.user);
        if (user) {
          await Payout.findByIdAndUpdate(payout._id, { user: user._id });
          console.log(`🔁 Linked payout ${payout._id} to user ${user.email}`);
        } else {
          console.warn(`⚠️ No user found for payout ${payout._id}`);
        }
      }
    }

    console.log('✅ Finished repairing payouts');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

fix();
