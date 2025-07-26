const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Seeding...');
    await Transaction.deleteMany();
    await Transaction.insertMany([
      {
        user: 'USER_ID_HERE',
        amount: 120,
        method: 'MoMo',
        status: 'Success',
        reference: 'TXN001',
      },
      {
        user: 'USER_ID_HERE',
        amount: 45,
        method: 'Card',
        status: 'Failed',
        reference: 'TXN002',
      },
      {
        user: 'USER_ID_HERE',
        amount: 200,
        method: 'MoMo',
        status: 'Pending',
        reference: 'TXN003',
      },
    ]);
    console.log('Done.');
    process.exit();
  })
  .catch((err) => console.error(err));
