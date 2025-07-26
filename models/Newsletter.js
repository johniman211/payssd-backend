const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: true },
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
