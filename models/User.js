const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    businessName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Enter a valid email address'],
    },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, enum: ['admin', 'merchant'], default: 'merchant' },

    // ✅ Email Verification
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    verifiedAt: { type: Date },

    // ✅ Password Reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // ✅ Account Status
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    suspendReason: { type: String, default: '' },

    // ✅ API Key
    apiKey: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(24).toString('hex'),
    },

    // ✅ KYC / Verification
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted',
    },
  },
  { timestamps: true }, // ✅ Automatically adds createdAt and updatedAt
);

// ✅ Pre-save hook: hash password & optionally generate token
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Only generate token if user is not verified and has no token
  if (!this.emailVerified && !this.verificationToken) {
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24hr token expiry
  }

  next();
});

// ✅ Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Generate new verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // refresh 24h token
  return token;
};

// ✅ Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

module.exports = mongoose.model('User', userSchema);
