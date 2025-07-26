const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: String,
    userEmail: String,
    ip: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
