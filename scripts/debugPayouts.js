// backend/scripts/debugPayouts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const User = require('../models/User');

(async () => {
  console.log('⏳ Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected.');

  const payouts = await Payout.find().populate('user', 'fullName email role');

  console.log(`📦 Total payouts: ${payouts.length}`);
  payouts.forEach((p) => {
    console.log(`- 💸 Payout ${p._id}:`);
    if (p.user) {
      console.log(
        `  👤 User: ${p.user.fullName} (${p.user.email}) [${p.user.role}]`,
      );
    } else {
      console.log('  ⚠️ No user populated');
    }
  });

  process.exit();
})();
