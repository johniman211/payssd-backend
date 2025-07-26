require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/southpay';

async function generateMerchants() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const merchants = [];

    for (let i = 1; i <= 50; i++) {
      const email = `merchant${i}@demo.com`;
      const mobile = `09110000${i.toString().padStart(2, '0')}`;

      // Skip if already exists
      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⚠️ Skipping existing: ${email}`);
        continue;
      }

      const merchant = new User({
        name: `Demo Merchant ${i}`,
        email,
        mobile,
        password: 'password123',
        role: 'merchant',
        kycStatus: 'not_set',
      });

      await merchant.save();
      merchants.push(merchant);
      console.log(`✅ Created: ${email}`);
    }

    console.log(`\n✅ Finished. Total merchants created: ${merchants.length}`);
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

generateMerchants();
