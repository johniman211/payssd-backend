require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://payssd:%2B211JOHNNINNI.com%2Fshameless@payssd.qrniazf.mongodb.net/payssd?retryWrites=true&w=majority&appName=PaySSD';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'admin@payssd.com';
    const password = 'Admin@123'; // raw password (it will be hashed automatically)
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      fullName: 'Super Admin',
      businessName: 'PaySSD',
      email,
      mobile: '0000000000',
      password, // raw password
      emailVerified: true,
      role: 'admin',
    });

    await admin.save();
    console.log(`✅ Admin created: ${email} / ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
})();
