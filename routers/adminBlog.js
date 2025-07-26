const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authMiddleware, requireRole } = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/email');

// 📁 Configure Multer for image uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'blog');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// ✅ Create new blog post
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        tags,
        seoTitle,
        seoDescription,
        publishDate,
        status,
      } = req.body;

      const newPost = new BlogPost({
        title,
        slug,
        excerpt,
        content,
        tags,
        seoTitle,
        seoDescription,
        publishDate,
        status,
        image: req.file ? `/uploads/blog/${req.file.filename}` : null,
      });

      const savedPost = await newPost.save();

      // ✅ Auto-send to newsletter subscribers
      const subscribers = await Newsletter.find();
      const promises = subscribers.map((sub) =>
        sendEmail({
          to: sub.email,
          subject: `📰 New Blog: ${savedPost.title}`,
          html: `
            <h2>${savedPost.title}</h2>
            <p>${savedPost.excerpt}</p>
            <p><a href="https://payssd.com/blog/${savedPost.slug}">Read full post →</a></p>
          `,
        }),
      );
      await Promise.all(promises);

      res.json({
        message: '✅ Blog post published and sent to subscribers',
        post: savedPost,
      });
    } catch (err) {
      console.error('❌ Failed to publish blog post:', err.message);
      res.status(500).json({ message: 'Blog publish failed' });
    }
  },
);

// ✅ Get all blog posts (admin view)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// ✅ Update blog post
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const updates = req.body;
      if (req.file) {
        updates.image = `/uploads/blog/${req.file.filename}`;
      }

      const updated = await BlogPost.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });
      res.json({ message: '✅ Blog updated', post: updated });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  },
);

// ✅ Delete blog post
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      await BlogPost.findByIdAndDelete(req.params.id);
      res.json({ message: '🗑️ Blog post deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete blog post' });
    }
  },
);

module.exports = router;
