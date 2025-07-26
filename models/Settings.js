const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    minPayoutAmount: { type: Number, default: 100 },
    maxPayoutAmount: { type: Number, default: 5000 },
    kycRequired: { type: Boolean, default: true },
    cardPaymentsEnabled: { type: Boolean, default: false },
    sandboxMode: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Settings', settingsSchema);
