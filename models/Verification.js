const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
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

    // File Uploads
    nationalIdFile: String,
    passportFile: String,
    selfieWithId: String,
    businessLicenseFile: String,
    bankStatement: String,
    businessPhoto: String,

    // Corrected Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'], // or maybe 'approve', 'reject'
      default: 'pending',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Verification', verificationSchema);
