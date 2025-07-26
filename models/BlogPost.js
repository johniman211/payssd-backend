const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    tags: [String],
    seoTitle: { type: String },
    seoDescription: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishDate: { type: Date },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
