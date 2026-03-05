const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Medicine', 'Cosmetics', 'Food', 'QR Product', 'Other'],
    default: 'Other'
  },
  itemImage: {
    type: String,
    default: null
  },
  source: {
    type: String,
    enum: ['api', 'manual'],
    required: true,
    default: 'api'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
