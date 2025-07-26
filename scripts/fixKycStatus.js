const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Verification = require('../models/Verification');

async function run() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const verifications = await Verification.find().populate('user');
    let updatedCount = 0;

    for (const v of verifications) {
      if (v.user && v.status && v.user.kycStatus !== v.status) {
        await User.findByIdAndUpdate(v.user._id, { kycStatus: v.status });
        updatedCount++;
      }
    }

    console.log(
      `✅ Updated ${updatedCount} user records with verification status.`,
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
