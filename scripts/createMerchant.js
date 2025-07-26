require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'merchant@example.com';
    const password = 'Merchant@123';

    let user = await User.findOne({ email });
    if (user) {
      console.log(`Merchant already exists: ${email}`);
      user.password = password; // triggers pre-save hashing
      user.emailVerified = true;
      await user.save();
      console.log(`Password reset for merchant: ${email}`);
    } else {
      user = new User({
        fullName: 'Test Merchant',
        businessName: 'Test Business',
        email,
        mobile: '0999999999',
        password,
        role: 'merchant',
        emailVerified: true,
      });
      await user.save();
      console.log(`✅ New merchant created: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating merchant:', err.message);
    process.exit(1);
  }
})();
