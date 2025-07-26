// backend/scripts/seedFakeTransactions.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection failed', err));

const methods = ['MTN MoMo', 'Card'];
const statuses = ['Completed', 'Pending', 'Failed'];

const generateRandomDate = () => {
  const start = new Date();
  start.setDate(start.getDate() - 30); // Past 30 days
  return new Date(
    start.getTime() + Math.random() * (Date.now() - start.getTime()),
  );
};

const seedTransactions = async () => {
  try {
    const merchants = await User.find({ role: 'merchant' });

    for (const merchant of merchants) {
      const numTransactions = Math.floor(Math.random() * 21) + 10; // 10–30 transactions

      const transactions = Array.from({ length: numTransactions }).map(() => ({
        user: merchant._id,
        amount: Math.floor(Math.random() * 5000) + 100, // SSP 100–5100
        method: methods[Math.floor(Math.random() * methods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: generateRandomDate(),
      }));

      await Transaction.insertMany(transactions);
      console.log(
        `💳 Created ${transactions.length} transactions for ${merchant.email}`,
      );
    }

    console.log('✅ Finished seeding fake transactions');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding transactions:', err);
    process.exit(1);
  }
};

seedTransactions();
