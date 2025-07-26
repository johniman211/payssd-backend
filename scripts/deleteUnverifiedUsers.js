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

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

    const result = await User.deleteMany({
      emailVerified: false,
      createdAt: { $lt: cutoff },
    });

    console.log(
      `🗑️ Deleted ${result.deletedCount} unverified users older than 48 hours`,
    );
    await mongoose.disconnect();
    console.log('✅ Done. Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
