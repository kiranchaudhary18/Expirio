const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  reminderDaysBefore: {
    type: Number,
    default: 1
  },
  itemImage: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  barcode: {
    type: String,
    default: null,
    index: true
  },
  expiryStatus: {
    type: String,
    enum: ['expired', 'expiringSoon', 'safe'],
    default: 'safe'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to calculate expiryStatus before saving
itemSchema.pre('save', function(next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(this.expiryDate);
  expiryDate.setHours(0, 0, 0, 0);

  if (expiryDate < today) {
    this.expiryStatus = 'expired';
  } else {
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= this.reminderDaysBefore) {
      this.expiryStatus = 'expiringSoon';
    } else {
      this.expiryStatus = 'safe';
    }
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
