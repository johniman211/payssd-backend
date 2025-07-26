require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Payout = require('../models/Payout');

(async () => {
  console.log('⏳ Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  try {
    const payouts = await Payout.find({});

    let fixedCount = 0;
    for (let payout of payouts) {
      if (typeof payout.user === 'string') {
        const fixed = await Payout.updateOne(
          { _id: payout._id },
          { $set: { user: ObjectId(payout.user) } },
        );
        if (fixed.modifiedCount === 1) fixedCount++;
      }
    }

    console.log(`✅ Fixed ${fixedCount} payout(s) with string user IDs.`);
  } catch (err) {
    console.error('❌ Error during payout user ID fix:', err.message);
  } finally {
    mongoose.disconnect();
  }
})();
