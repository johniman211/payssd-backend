const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Verification = require('../models/Verification');
const User = require('../models/User');

dotenv.config();

// Replace with your actual MongoDB URI if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/southpay';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const merchants = await User.find({ role: 'merchant' }).limit(20);

    const eligibleMerchants = [];

    for (const merchant of merchants) {
      const exists = await Verification.findOne({ user: merchant._id });
      if (!exists) eligibleMerchants.push(merchant);
    }

    if (eligibleMerchants.length === 0) {
      console.log('⚠️ All selected merchants already have verifications.');
      return;
    }

    const verifications = eligibleMerchants.map((merchant, i) => ({
      user: merchant._id,
      fullName: `Test User ${i + 1}`,
      email: `merchant${i + 1}@test.com`,
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
    console.log(`✅ Inserted ${verifications.length} fake verifications.`);
  } catch (err) {
    console.error('❌ Error seeding verifications:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
