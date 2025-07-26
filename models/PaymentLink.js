const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SSP' },
  status: { type: String, default: 'pending' }, // 'pending' or 'paid'
  merchantName: { type: String }, // Optional merchant display name
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);
