const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendSubscriptionAddedEmail } = require('../services/emailService');

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { userId, subscriptionName, renewalDate, amount, renewalReminderDays } = req.body;

    // Validate required fields
    if (!userId || !subscriptionName || !renewalDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, subscriptionName, renewalDate'
      });
    }

    const newSubscription = new Subscription({
      userId,
      subscriptionName,
      renewalDate,
      amount: amount || null,
      renewalReminderDays: renewalReminderDays || 1
    });

    await newSubscription.save();

    // Send email notification to user (asynchronously - don't wait)
    // This runs in background without blocking the API response
    User.findById(userId).then(user => {
      if (user && user.emailNotifications) {
        sendSubscriptionAddedEmail(user.email, user.name, subscriptionName, amount || 0, renewalDate).catch(err => {
          console.error('⚠️  Subscription email failed to send in background:', err.message);
        });
      }
    }).catch(err => {
      console.error('⚠️  Error fetching user for email:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: newSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// Get all subscriptions for a user
exports.getSubscriptionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const subscriptions = await Subscription.find({ userId }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subscription',
      error: error.message
    });
  }
};
