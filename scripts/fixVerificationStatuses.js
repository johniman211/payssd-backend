// backend/scripts/fixVerificationStatuses.js
const mongoose = require('mongoose');
const Verification = require('../models/Verification');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const updates = await Verification.updateMany(
      { status: { $in: ['approved', 'rejected'] } },
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'approved'] }, then: 'approve' },
                  { case: { $eq: ['$status', 'rejected'] }, then: 'reject' },
                ],
                default: '$status',
              },
            },
          },
        },
      ],
    );

    console.log(`✅ Updated ${updates.modifiedCount} record(s).`);
    process.exit();
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
  });
