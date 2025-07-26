require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'admin@payssd.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(0);
    }

    console.log('--- Admin User Info ---');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Verified:', user.emailVerified);
    console.log('Password hash:', user.password);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
