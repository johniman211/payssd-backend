const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      process.exit(0);
    }

    let updated = 0;

    for (let user of users) {
      if (!user.apiKey) {
        user.apiKey = crypto.randomBytes(24).toString('hex');
        await user.save();
        console.log(`✅ Set API key for: ${user.email}`);
        updated++;
      } else {
        console.log(`ℹ️ Already has API key: ${user.email}`);
      }
    }

    console.log(`\n✅ Done! ${updated} user(s) updated.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
