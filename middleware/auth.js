const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;

// ✅ Auth middleware: verify token and attach user to req.user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // ✅ Attach full user object to request
    next();
  } catch (err) {
    console.log('❌ Invalid token:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Role-based access: pass ['admin'], ['merchant'], etc.
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient role' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
