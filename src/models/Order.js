const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  coordinates: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  serviceType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  description: { type: String, required: true },
  budget: String,
  timeline: String,
  relatedPics: [{ url: String, public_id: String }],
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  estimatedCost: Number,
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
