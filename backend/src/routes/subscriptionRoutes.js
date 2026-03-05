const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Create a new subscription
router.post('/subscriptions', subscriptionController.createSubscription);

// Get all subscriptions for a user
router.get('/subscriptions/:userId', subscriptionController.getSubscriptionsByUserId);

// Update a subscription
router.put('/subscription/:id', subscriptionController.updateSubscription);

// Delete a subscription
router.delete('/subscription/:id', subscriptionController.deleteSubscription);

module.exports = router;
