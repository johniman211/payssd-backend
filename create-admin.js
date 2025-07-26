// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User'); // adjust if needed

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({
      email: 'support@unionskincare.store',
    });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.email);
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('123456', 10); // ⚠️ Simple password

    const admin = await User.create({
      fullName: 'Admin',
      businessName: 'PaySSD Admin',
      email: 'support@unionskincare.store',
      mobile: '0110000000',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
      status: 'Active',
      kycStatus: 'approved',
      apiKey: require('crypto').randomBytes(24).toString('hex'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin created:', admin.email);
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
