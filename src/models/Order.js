const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phoneNumber: String,
  address: String,
  service: String,
  description: String,
  relatedPics: [{ url: String, public_id: String }],
  status: { type: String, enum: ['pending','in progress','cancelled','complete'], default: 'pending' },
  estimatedCost: Number,
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
