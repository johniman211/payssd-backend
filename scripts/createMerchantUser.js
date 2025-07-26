const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function createMerchant() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'merchantdemo@payssd.com' });
    if (existing) {
      console.log('ℹ️ Merchant already exists:', existing.email);
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = new User({
      name: 'Demo Merchant',
      businessName: 'Demo Business Ltd',
      email: 'merchantdemo@payssd.com',
      mobile: '0920000099',
      password: hashedPassword,
      role: 'merchant',
      isVerified: true,
    });

    await user.save();
    console.log('✅ Created demo merchant user');
    console.log('📧 Email: merchantdemo@payssd.com');
    console.log('🔑 Password: password123');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createMerchant();
