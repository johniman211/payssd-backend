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
    const newPassword = 'Admin@123'; // will be hashed by pre-save hook

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(0);
    }

    user.password = newPassword; // triggers pre-save hashing
    await user.save();

    console.log(`✅ Password reset for ${email}: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting password:', err.message);
    process.exit(1);
  }
})();
