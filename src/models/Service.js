const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  price: {
    min: { type: Number },
    max: { type: Number },
    unit: { type: String }
  },
  features: [String],
  images: [{ url: String, public_id: String }],
  duration: String,
  popular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
