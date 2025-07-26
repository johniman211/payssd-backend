const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Blog = require('../models/Blog');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/blogs');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ GET all blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('❌ Error fetching blogs:', err.message);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// ✅ GET single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error('❌ Error fetching blog by slug:', err.message);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
});

// ✅ POST new blog post (admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const image = req.file ? `/uploads/blogs/${req.file.filename}` : null;

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content required' });
      }

      const blog = new Blog({ title, content, image });
      await blog.save();
      res.status(201).json(blog);
    } catch (err) {
      console.error('❌ Error creating blog:', err.message);
      res.status(500).json({ message: 'Failed to create blog' });
    }
  },
);

// ✅ DELETE a blog post (admin only)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      await Blog.findByIdAndDelete(req.params.id);
      res.json({ message: 'Blog deleted' });
    } catch (err) {
      console.error('❌ Error deleting blog:', err.message);
      res.status(500).json({ message: 'Failed to delete blog' });
    }
  },
);

module.exports = router;
