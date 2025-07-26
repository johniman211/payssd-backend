// backend/scripts/deleteAllUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await User.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} users from the database`);

    await mongoose.disconnect();
    console.log('✅ Done. Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error deleting users:', err.message);
    process.exit(1);
  }
};

run();
