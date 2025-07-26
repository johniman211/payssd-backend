const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    const email = 'admin@example.com'; // 👈 Replace with your real user email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const newKey = crypto.randomBytes(24).toString('hex');
    user.apiKey = newKey;
    await user.save();
    console.log('✅ API Key set to:', newKey);
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
