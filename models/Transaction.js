// backend/models/Transaction.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to the merchant who owns the transaction
    required: true,
  },
  type: {
    type: String,
    enum: ['MoMo', 'Card'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
    default: 'Pending',
  },
  reference: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
  },
  customerName: {
    type: String,
  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
