const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'merchant@payssd.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('ℹ️ Merchant already exists:', email);
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const newUser = new User({
      name: 'Test Merchant',
      businessName: 'Test Business Ltd',
      email,
      mobile: '0923456789',
      password: hashedPassword,
      role: 'merchant',
      isVerified: true,
      status: 'Active',
    });

    await newUser.save();
    console.log('✅ User created successfully:');
    console.log('📧 Email: merchant@payssd.com');
    console.log('🔑 Password: password123');
    console.log('📱 Mobile: 0923456789');
    console.log('🧾 Role: merchant');
    console.log('✅ KYC Status: not_set');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating user:', err);
    process.exit(1);
  }
}

run();
