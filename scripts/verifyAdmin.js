// scripts/verifyAdmin.js
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ role: "admin", email: "admin@payssd.com" });

    if (!admin) {
      console.log("❌ No admin user found.");
      process.exit(0);
    }

    admin.emailVerified = true;
    admin.verificationToken = undefined;
    admin.verificationTokenExpires = undefined;
    admin.verifiedAt = new Date();

    await admin.save();
    console.log(`✅ Admin ${admin.email} is now verified`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error verifying admin:", err);
    process.exit(1);
  }
})();
