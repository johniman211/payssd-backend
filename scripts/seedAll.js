const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Verification = require('../models/Verification');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/southpay';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create 20 fake merchant users if they don’t already exist
    const existingMerchants = await User.find({
      email: /merchant\d+@test\.com/,
    });

    if (existingMerchants.length < 20) {
      console.log(
        `👤 Creating ${20 - existingMerchants.length} fake merchant users...`,
      );

      const usersToCreate = [];

      for (let i = 1; i <= 20; i++) {
        const email = `merchant${i}@test.com`;
        const exists = existingMerchants.find((u) => u.email === email);
        if (!exists) {
          usersToCreate.push({
            name: `Merchant ${i}`,
            email,
            password: await bcrypt.hash('password123', 10),
            role: 'merchant',
            mobile: `09230000${i}`,
            kycStatus: 'not_set',
          });
        }
      }

      if (usersToCreate.length) {
        await User.insertMany(usersToCreate);
        console.log(`✅ Created ${usersToCreate.length} new merchants.`);
      }
    } else {
      console.log('✅ 20 fake merchants already exist.');
    }

    // 2. Create verifications for merchants who don’t have one yet
    const merchants = await User.find({ email: /merchant\d+@test\.com/ });

    const eligibleMerchants = [];

    for (const merchant of merchants) {
      const exists = await Verification.findOne({ user: merchant._id });
      if (!exists) eligibleMerchants.push(merchant);
    }

    if (eligibleMerchants.length === 0) {
      console.log('⚠️ All merchants already have verifications.');
    } else {
      const verifications = eligibleMerchants.map((user, i) => ({
        user: user._id,
        fullName: `Test User ${i + 1}`,
        email: user.email,
        phone: `09123456${i}`,
        nationality: 'South Sudanese',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        address: 'Juba Town',
        nationalId: `SSN${i}2345`,
        passportNumber: `PPT${i}9876`,
        businessName: `TestBiz ${i + 1}`,
        businessType: 'Retail',
        taxId: `TAX00${i}`,
        businessAddress: 'Juba Market',
        website: 'https://example.com',
        bankName: 'Equity Bank',
        bankAccount: `10020030${i}`,
        accountHolder: `Holder ${i + 1}`,
        bankBranch: 'Juba Main',
        declarations: 'I confirm all info is valid.',
        nationalIdFile: '',
        passportFile: '',
        selfieWithId: '',
        businessLicenseFile: '',
        bankStatement: '',
        businessPhoto: '',
        status: i % 2 === 0 ? 'pending' : 'approved',
      }));

      await Verification.insertMany(verifications);
      console.log(`✅ Inserted ${verifications.length} verifications.`);
    }
  } catch (err) {
    console.error('❌ Error during seed:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
