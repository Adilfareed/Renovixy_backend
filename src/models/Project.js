const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  images: [{ url: String, public_id: String }],
  client: String,
  location: String,
  duration: String,
  completedDate: Date,
  status: { type: String, enum: ['completed', 'ongoing', 'planned'], default: 'planned' },
  featured: { type: Boolean, default: false },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  budget: {
    min: { type: Number },
    max: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
