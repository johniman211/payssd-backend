const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// GET all published posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: 'published' }).sort({
      publishDate: -1,
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load blog list' });
  }
});

// GET post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: 'published',
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load blog post' });
  }
});

module.exports = router;
