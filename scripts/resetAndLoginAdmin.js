require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'changeme';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const email = 'admin@payssd.com';
    const password = 'Admin@123';

    // 1. Delete existing admin
    await User.deleteOne({ email });
    console.log(`🗑️  Deleted old admin (${email})`);

    // 2. Create fresh admin (raw password triggers pre-save hashing)
    const admin = new User({
      fullName: 'Super Admin',
      businessName: 'PaySSD',
      email,
      mobile: '0000000000',
      password, // raw, will be hashed by pre-save hook
      role: 'admin',
      emailVerified: true,
    });
    await admin.save();
    console.log(`✅ New admin created: ${email} / ${password}`);

    // 3. Generate token to confirm login works
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`🔑 Login Token: ${token}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting admin:', err.message);
    process.exit(1);
  }
})();
