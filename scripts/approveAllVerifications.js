const mongoose = require('mongoose');
const Verification = require('../models/Verification');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const result = await Verification.updateMany(
      { status: { $ne: 'approved' } },
      { status: 'approved' },
    );

    console.log(`✅ Approved ${result.modifiedCount} verifications`);
    process.exit();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
