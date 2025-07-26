// scripts/countVerifications.js

const mongoose = require('mongoose');
require('dotenv').config();
const Verification = require('../models/Verification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payssd';

async function countVerifications() {
  try {
    await mongoose.connect(MONGO_URI);
    const count = await Verification.countDocuments();
    console.log(`📄 Total Verifications: ${count}`);
    const sample = await Verification.find().limit(5);
    console.log('🔍 Sample:', sample);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

countVerifications();
