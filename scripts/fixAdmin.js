require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@payssd.com';
    const password = 'Admin@123';

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: 'Super Admin',
        businessName: 'PaySSD',
        email,
        mobile: '0000000000',
        password,
        role: 'admin',
        emailVerified: true,
      });
    } else {
      user.password = password;  // <-- raw password triggers auto hash
      user.emailVerified = true;
    }

    await user.save();
    console.log(`✅ Admin fixed: ${email} / ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing admin:', err.message);
    process.exit(1);
  }
})();
