// backend/scripts/fixPasswords.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI; // ✅ Use the correct key here

async function fixPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const merchants = await User.find({ role: 'merchant' });

    for (let user of merchants) {
      const isHashed = user.password?.startsWith('$2a$');
      if (!isHashed) {
        user.password = await bcrypt.hash('password123', 10);
        await user.save();
        console.log(`🔑 Fixed password for ${user.email}`);
      } else {
        console.log(`✅ Already hashed: ${user.email}`);
      }
    }

    console.log('✅ Finished updating merchant passwords');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixPasswords();
