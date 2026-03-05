const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  subscriptionName: {
    type: String,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    default: null
  },
  renewalReminderDays: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
