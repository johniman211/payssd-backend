require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Verification = require('../models/Verification');
const Payout = require('../models/Payout');

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/southpay';
const methods = ['Bank Transfer', 'MTN MoMo']; // ✅ Only allowed payout methods

async function seedAll() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const merchants = [];
    for (let i = 1; i <= 50; i++) {
      const email = `merchant${i}@demo.com`;
      const mobile = `09110000${i.toString().padStart(2, '0')}`;

      // Create merchant if not exists
      let merchant = await User.findOne({ email });
      if (!merchant) {
        merchant = await User.create({
          name: `Demo Merchant ${i}`,
          email,
          mobile,
          password: 'password123',
          role: 'merchant',
          kycStatus: 'Approved',
        });
        console.log(`✅ Created Merchant: ${email}`);
      } else {
        console.log(`ℹ️ Merchant already exists: ${email}`);
      }

      merchants.push(merchant);

      // Submit KYC if not exists
      const existingKyc = await Verification.findOne({ user: merchant._id });
      if (!existingKyc) {
        await Verification.create({
          user: merchant._id,
          fullName: merchant.name,
          email: merchant.email,
          phone: merchant.mobile,
          nationalId: 'SS' + i.toString().padStart(6, '0'),
          passportNumber: 'P' + i.toString().padStart(6, '0'),
          businessName: `Merchant Shop ${i}`,
          businessType: 'Retail',
          bankName: 'Demo Bank',
          bankAccount: '12345678' + i,
          accountHolder: merchant.name,
          status: 'Approved',
        });
        console.log(`📋 Submitted KYC for ${email}`);
      }

      // Create test payout for every 5th merchant
      if (i % 5 === 0) {
        await Payout.create({
          user: merchant._id,
          amount: Math.floor(Math.random() * 5000) + 1000,
          method: methods[Math.floor(Math.random() * methods.length)], // ✅ Use only allowed values
          status: 'Pending',
          requestedAt: new Date(),
        });
        console.log(`💸 Created payout request for ${email}`);
      }
    }

    console.log('\n✅ Finished seeding 50 merchants, KYCs, and payouts.');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAll();
