const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({});
    console.log('📋 Users in DB:');
    users.forEach((u) => {
      console.log(`🧑 ${u.email} | ${u._id}`);
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
