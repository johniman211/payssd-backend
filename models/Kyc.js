const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One Verification per user
    },

    // Personal Info
    fullName: String,
    dateOfBirth: String,
    gender: String,
    nationality: String,
    email: String,
    phone: String,
    address: String,
    nationalId: String,
    passportNumber: String,

    // Business Info
    businessName: String,
    businessType: String,
    businessLicense: String,
    taxId: String,
    businessAddress: String,
    website: String,

    // Bank Info
    bankName: String,
    bankAccount: String,
    accountHolder: String,
    bankBranch: String,

    // Declarations
    declarations: String,

    // File Uploads (stored as filenames)
    nationalIdFile: String,
    passportFile: String,
    selfieWithId: String,
    businessLicenseFile: String,
    bankStatement: String,
    businessPhoto: String,

    // Status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    reviewedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Verification', kycSchema);
