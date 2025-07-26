const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  smtp: String,
  payoutLimit: Number,
  password: String,
});

module.exports = mongoose.model('Setting', settingSchema);
