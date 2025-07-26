const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust if model path is different
require('dotenv').config();

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const hashedPassword = await bcrypt.hash('123456', 10);

    const result = await User.findOneAndUpdate(
      { email: 'support@unionskincare.store' },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    );

    if (result) {
      console.log('✅ Admin password reset to 123456');
    } else {
      console.log('❌ Admin user not found.');
    }

    process.exit();
  } catch (err) {
    console.error('❌ Error resetting admin password:', err);
    process.exit(1);
  }
}

resetAdminPassword();
