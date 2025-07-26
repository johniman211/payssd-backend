// scripts/updateKycStatus.js
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('YOUR_MONGODB_URI');

(async () => {
  const user = await User.findById('686526d765d7d61cfe54defa');
  if (user) {
    user.kycStatus = 'approved';
    await user.save();
    console.log('✅ kycStatus updated in user model');
  } else {
    console.log('❌ User not found');
  }
  process.exit();
})();
