const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// 🔐 Get platform settings
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied' });
  const settings = await Settings.findOne();
  res.json(settings);
});

// 🔐 Update platform settings
router.post('/update', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied' });

  const existing = await Settings.findOne();
  if (existing) {
    Object.assign(existing, req.body);
    await existing.save();
    return res.json(existing);
  } else {
    const newSettings = new Settings(req.body);
    await newSettings.save();
    return res.json(newSettings);
  }
});

// 🔐 Update user role
router.post('/role/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied' });

  const { role } = req.body;
  if (!['admin', 'merchant'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.role = role;
  await user.save();
  res.json({ message: 'Role updated', user });
});

module.exports = router;
