const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['commercial','renovation','residential','others'], default: 'others' },
  description: String,
  image: { url: String, public_id: String },
  
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
