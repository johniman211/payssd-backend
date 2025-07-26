require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Verification = require('../models/Verification');

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/southpay';

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // 1. Ensure Admin exists
    let admin = await User.findOne({ email: 'admin@payssd.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@payssd.com',
        password: 'admin123',
        role: 'admin',
        mobile: '0999999999',
      });
      console.log('✅ Created new admin');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // 2. Ensure Merchant exists
    let merchant = await User.findOne({ email: 'merchant@demo.com' });
    if (!merchant) {
      merchant = await User.create({
        name: 'Test Merchant',
        email: 'merchant@demo.com',
        password: 'password123',
        role: 'merchant',
        mobile: '0923456799', // ✅ changed to avoid conflict
        kycStatus: 'pending',
      });
      console.log('✅ Created new merchant');
    } else {
      console.log('ℹ️ Merchant already exists:', merchant.email);
    }

    // 3. Ensure Verification exists
    const existing = await Verification.findOne({ user: merchant._id });
    if (!existing) {
      await Verification.create({
        user: merchant._id,
        status: 'pending',
        fullName: 'John Demo',
        email: merchant.email,
        phone: merchant.mobile || '0923456799',
        nationalId: 'SS123456',
        passportNumber: 'A000001',
        businessName: 'Demo Shop',
        businessType: 'Retail',
        bankName: 'Demo Bank',
        bankAccount: '12345678',
        accountHolder: 'John Demo',
      });
      console.log('✅ Created test verification');
    } else {
      console.log('ℹ️ Verification already exists');
    }

    console.log('\n✅ Login with:');
    console.log('🔑 Admin:    admin@payssd.com / admin123');
    console.log('🧾 Merchant: merchant@demo.com / password123');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seed();
