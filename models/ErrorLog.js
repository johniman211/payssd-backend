const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    type: String,
    message: String,
    stack: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('ErrorLog', errorLogSchema);
