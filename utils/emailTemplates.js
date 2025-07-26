// backend/utils/emailTemplates.js

exports.verificationEmail = (verifyUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
    <h2 style="color: #2563eb;">Welcome to PaySSD</h2>
    <p>Click the button below to verify your email address and activate your account:</p>
    <a href="${verifyUrl}" 
       style="display:inline-block;background:#2563eb;color:#fff;
              padding:10px 20px;border-radius:6px;text-decoration:none;">
      Verify Email
    </a>
    <p style="margin-top:20px;">If you did not request this email, please ignore it.</p>
  </div>
`;

exports.resetPasswordEmail = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
    <h2 style="color: #2563eb;">Reset Your Password</h2>
    <p>You requested to reset your password. Click the button below:</p>
    <a href="${resetUrl}" 
       style="display:inline-block;background:#2563eb;color:#fff;
              padding:10px 20px;border-radius:6px;text-decoration:none;">
      Reset Password
    </a>
    <p style="margin-top:20px;">If you did not request this, you can ignore this email.</p>
  </div>
`;

exports.welcomeEmail = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
    <h2 style="color: #2563eb;">Welcome to PaySSD, ${name}!</h2>
    <p>Your account is now active and ready to use.</p>
    <p>Thank you for choosing us to power your payments.</p>
  </div>
`;
