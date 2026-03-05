const cron = require('node-cron');
const Item = require('../models/Item');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendExpiryReminderEmail, sendSubscriptionRenewalEmail } = require('./emailService');

let scheduledJobs = [];

/**
 * Calculate days until date
 */
const getDaysUntil = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Send expiry reminders for items
 * Runs daily at 8:00 AM
 */
const startItemExpiryScheduler = () => {
  console.log('⏰ Starting Item Expiry Scheduler...');
  
  const job = cron.schedule('0 8 * * *', async () => {
    try {
      console.log('🔍 Checking for items requiring reminders...');
      
      // Get all items
      const items = await Item.find({});
      
      for (const item of items) {
        const daysUntil = getDaysUntil(item.expiryDate);
        
        // Send reminder if:
        // 1. Today matches reminder date (daysUntil === reminderDaysBefore)
        // 2. Item has already expired (daysUntil <= 0)
        if (daysUntil === item.reminderDaysBefore || daysUntil <= 0) {
          try {
            const user = await User.findById(item.userId);
            if (user && user.emailNotifications) {
              await sendExpiryReminderEmail(
                user.email,
                user.name,
                item.itemName,
                item.expiryDate,
                daysUntil
              );
              console.log(`📧 Expiry reminder sent for item: ${item.itemName} (${daysUntil} days)`);
            }
          } catch (error) {
            console.error(`❌ Error sending expiry reminder for item ${item._id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Item Expiry Scheduler Error:', error.message);
    }
  });

  scheduledJobs.push(job);
  console.log('✅ Item Expiry Scheduler started');
};

/**
 * Send renewal reminders for subscriptions
 * Runs daily at 9:00 AM
 */
const startSubscriptionRenewalScheduler = () => {
  console.log('⏰ Starting Subscription Renewal Scheduler...');
  
  const job = cron.schedule('0 9 * * *', async () => {
    try {
      console.log('🔍 Checking for subscriptions requiring reminders...');
      
      // Get all subscriptions
      const subscriptions = await Subscription.find({});
      
      for (const subscription of subscriptions) {
        const daysUntil = getDaysUntil(subscription.renewalDate);
        
        // Send reminder if:
        // 1. Today matches reminder date (daysUntil === renewalReminderDays)
        // 2. Subscription has already renewed/passed (daysUntil <= 0)
        if (daysUntil === subscription.renewalReminderDays || daysUntil <= 0) {
          try {
            const user = await User.findById(subscription.userId);
            if (user && user.emailNotifications) {
              await sendSubscriptionRenewalEmail(
                user.email,
                user.name,
                subscription.subscriptionName,
                subscription.amount,
                subscription.renewalDate,
                daysUntil
              );
              console.log(`📧 Renewal reminder sent for subscription: ${subscription.subscriptionName} (${daysUntil} days)`);
            }
          } catch (error) {
            console.error(`❌ Error sending renewal reminder for subscription ${subscription._id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Subscription Renewal Scheduler Error:', error.message);
    }
  });

  scheduledJobs.push(job);
  console.log('✅ Subscription Renewal Scheduler started');
};

/**
 * Initialize all schedulers
 */
const initializeSchedulers = () => {
  console.log('🚀 Initializing Email Schedulers...');
  startItemExpiryScheduler();
  startSubscriptionRenewalScheduler();
  console.log('✅ All Schedulers Initialized');
};

/**
 * Stop all scheduled jobs
 */
const stopAllSchedulers = () => {
  console.log('🛑 Stopping all schedulers...');
  scheduledJobs.forEach(job => {
    job.stop();
  });
  scheduledJobs = [];
  console.log('✅ All schedulers stopped');
};

module.exports = {
  initializeSchedulers,
  stopAllSchedulers,
  getDaysUntil
};
