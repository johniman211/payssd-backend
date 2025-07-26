// scripts/generateApiKeysForVerifiedMerchants.js
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;

const run = async () => {
  console.log('⏳ Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const merchants = await User.find({
      role: 'merchant',
      verificationStatus: 'approved',
      apiKey: { $in: [null, ''] },
    });

    console.log(`🔍 Found ${merchants.length} merchants missing API keys`);

    for (const merchant of merchants) {
      merchant.apiKey = crypto.randomBytes(32).toString('hex');
      await merchant.save();
      console.log(`✅ API key generated for ${merchant.email}`);
    }

    console.log('🎉 Done generating missing API keys.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
