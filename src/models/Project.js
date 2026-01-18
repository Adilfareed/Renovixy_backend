const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['commercial','renovation','residential','others'], default: 'others' },
  description: String,
  images: [{ url: String, public_id: String }],
  
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
