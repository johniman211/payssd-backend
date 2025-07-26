require('dotenv').config();
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const post = await BlogPost.findOne();
    if (!post) {
      console.log('❌ No blog posts found.');
      return;
    }

    post.status = 'published';
    await post.save();

    console.log(`✅ Blog post "${post.title}" set to 'published'`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

run();
