// scripts/deleteMerchants.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoURI = process.env.MONGODB_URI;

async function deleteMerchants() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Delete all users except admin role
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑️ Deleted ${result.deletedCount} merchant accounts`);

    mongoose.connection.close();
    console.log('✅ Done & connection closed');
  } catch (err) {
    console.error('❌ Error deleting merchants:', err);
    process.exit(1);
  }
}

deleteMerchants();
