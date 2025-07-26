const mongoose = require('mongoose');
require('dotenv').config();

const Verification = require('../models/Verification');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const updates = await Verification.updateMany(
      { status: { $in: ['Approve', 'Pending', 'Reject'] } },
      [
        {
          $set: {
            status: {
              $cond: [
                { $eq: ['$status', 'Approve'] },
                'approved',
                {
                  $cond: [
                    { $eq: ['$status', 'Reject'] },
                    'rejected',
                    'pending',
                  ],
                },
              ],
            },
          },
        },
      ],
    );

    console.log(`✅ Updated ${updates.modifiedCount} records`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
