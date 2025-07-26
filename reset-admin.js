const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adjust path if needed
require('dotenv').config();

async function resetAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('123456', 10);

  await User.findOneAndUpdate(
    { email: 'support@unionskincare.store' },
    {
      $set: {
        password: hashedPassword,
        emailVerified: true,
        role: 'admin',
        status: 'Active',
        kycStatus: 'approved',
        updatedAt: new Date(),
      },
    },
  );

  console.log('✅ Admin password reset to 123456');
  process.exit();
}

resetAdmin();
