const ErrorLog = require('../models/ErrorLog');

const logError = async (req, error, userId = null) => {
  try {
    await ErrorLog.create({
      endpoint: req.originalUrl,
      method: req.method,
      message: error.message,
      stack: error.stack,
      user: userId,
    });
  } catch (e) {
    console.error('Error logging failed:', e.message);
  }
};

module.exports = logError;
