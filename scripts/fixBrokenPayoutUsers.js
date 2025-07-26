require('dotenv').config(); // ✅ Loads .env

const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI; // ✅ Use your .env variable

const fixPayouts = async () => {
  try {
    console.log('⏳ Connecting...');
    await mongoose.connect(MONGO_URI); // ✅ Must be valid
    console.log('✅ Connected');

    // Your logic here...

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

fixPayouts();
