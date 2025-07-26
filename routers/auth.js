const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cors = require("cors");

const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
let refreshTokens = [];

// 📧 SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 📧 Send Verification Email
const sendVerificationEmail = async (email, token) => {
  const link = `${CLIENT_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your PaySSD Email",
    html: `<p>Click below to verify your email:</p><a href="${link}">${link}</a>`,
  });
};

// 📧 Send Password Reset Email
const sendResetEmail = async (email, token) => {
  const link = `${CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your PaySSD Password",
    html: `<p>Click below to reset your password:</p><a href="${link}">${link}</a>`,
  });
};

// JWT Token Generators
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokens.push(token);
  return token;
};

// ======================= ROUTES =======================

// User Signup
router.post("/signup", async (req, res) => {
  const { fullName, businessName, email, mobile, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ fullName, businessName, email, mobile, password });
    user.verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    // Generate tokens (so frontend can store)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send response excluding password
    res.status(201).json({
      message: "Signup successful. Verify your email.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        apiKey: user.apiKey,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});



// ✅ Email Verification (Updated)
// ✅ Email verification - auto login & redirect to dashboard
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=failed`);
    }

    // Mark user as verified
    user.emailVerified = true;
    user.verifiedAt = new Date();
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate access token & refresh token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect with tokens (frontend will handle and save them)
    const redirectUrl = `${process.env.CLIENT_URL}/dashboard?verified=true&accessToken=${accessToken}&refreshToken=${refreshToken}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Email verification error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=failed`);
  }
});




// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetEmail(email, token);
    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated. You may now login." });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email }, { mobile: email }] });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.emailVerified)
      return res.status(401).json({ message: "Please verify your email first" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        apiKey: user.apiKey,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Only match admin users
    const user = await User.findOne({ email, role: "admin" });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Skip email verification check for admin
    if (user.role !== "admin" && !user.emailVerified) {
      return res.status(403).json({ message: "Verify email before logging in." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Refresh Token
router.post("/refresh", (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.includes(token))
    return res.status(403).json({ message: "Invalid refresh token" });

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken({
      _id: decoded.id,
      role: decoded.role,
    });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Logged out" });
});

// Current User
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "fullName email mobile role emailVerified"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;
