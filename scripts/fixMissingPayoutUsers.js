require('dotenv').config();
const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const User = require('../models/User');

const run = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find all payouts with missing or broken user reference
    const brokenPayouts = await Payout.find({
      $or: [{ user: null }, { user: { $exists: false } }],
    });
    console.log(`🔍 Found ${brokenPayouts.length} payout(s) with missing user`);

    if (brokenPayouts.length === 0) return process.exit(0);

    // Step 2: Pick any test merchant user
    const fallbackUser = await User.findOne({ role: 'merchant' });
    if (!fallbackUser) {
      console.log(
        '❌ No fallback user found. Please create a merchant user first.',
      );
      return process.exit(1);
    }

    // Step 3: Fix broken payouts
    let fixed = 0;
    for (const payout of brokenPayouts) {
      payout.user = fallbackUser._id;
      await payout.save();
      fixed++;
    }

    console.log(
      `✅ Fixed ${fixed} payout(s) by assigning fallback user: ${fallbackUser.fullName}`,
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
