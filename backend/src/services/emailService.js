const nodemailer = require('nodemailer');

// Create reusable transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail', // Explicitly use Gmail service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App Password, not regular password
  },
  // Gmail specific settings
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Service Configuration Error:', error.message);
    console.error('❌ Email verification failed. Check your credentials:');
    console.error('   - EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
    console.error('   - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing');
  } else {
    console.log('✅ Email Service is properly configured and ready to send emails');
    console.log('✅ SMTP connection established successfully');
  }
});

console.log('📧 Email Service Initialized:', {
  service: 'Gmail',
  user: process.env.EMAIL_USER || 'NOT SET',
  status: 'Verifying...',
});

/**
 * Send Welcome Email
 */
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('📧 [Welcome Email] Starting email send process');
    console.log('📧 [Welcome Email] Target email:', userEmail);
    console.log('📧 [Welcome Email] User name:', userName);

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Welcome to Expirio - Your Smart Expiry Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Welcome to Expirio!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              Thank you for joining Expirio! We're thrilled to have you on board. 
              Expirio helps you track the expiry dates of your items and subscriptions, 
              ensuring you never miss an important renewal or warning.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Quick Start Guide:</h3>
              <ul style="color: #555; line-height: 1.8; font-size: 14px;">
                <li>📷 <strong>Scan Barcodes:</strong> Quickly scan food packets, medicines, and products</li>
                <li>📅 <strong>Track Expiry:</strong> Never miss an expiry date with smart reminders</li>
                <li>💳 <strong>Manage Subscriptions:</strong> Keep all your subscriptions organized</li>
                <li>🔔 <strong>Get Alerts:</strong> Receive timely notifications before things expire</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              If you have any questions or need help, feel free to reach out to our support team.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              © 2026 Expirio. All rights reserved.<br>
              Made with ❤️ by Kiran Dekaliya
            </p>
          </div>
        </div>
      `,
    };

    console.log('📧 [Welcome Email] Mail options prepared');
    console.log('📧 [Welcome Email] Attempting to send email...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Welcome Email] Email sent successfully!');
    console.log('✅ [Welcome Email] Message ID:', info.messageId);
    console.log('✅ [Welcome Email] Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('❌ [Welcome Email] FAILED TO SEND');
    console.error('❌ [Welcome Email] Error type:', error.name);
    console.error('❌ [Welcome Email] Error code:', error.code);
    console.error('❌ [Welcome Email] Error message:', error.message);
    
    if (error.response) {
      console.error('❌ [Welcome Email] SMTP Response:', error.response);
    }
    
    if (error.responseCode) {
      console.error('❌ [Welcome Email] SMTP Code:', error.responseCode);
    }
    
    console.error('❌ [Welcome Email] Full error:', error);
    
    return false;
  }
};

/**
 * Send Item Added Email
 */
exports.sendItemAddedEmail = async (userEmail, userName, itemName, expiryDate) => {
  let errorDetails = null;
  
  try {
    console.log('📧 [Item Email] Starting email send process');
    console.log('📧 [Item Email] Target email:', userEmail);
    console.log('📧 [Item Email] User name:', userName);
    
    const expiryDateFormatted = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Item Added: ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📦 Item Successfully Added</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              Great! You've successfully added a new item to your Expirio tracker.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Item Details:</h3>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Name:</strong> ${itemName}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Expires on:</strong> ${expiryDateFormatted}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              You'll receive a reminder before this item expires. Keep your items organized and never worry about expiry dates again!
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              © 2026 Expirio. All rights reserved.<br>
              Made with ❤️ by Kiran Dekaliya
            </p>
          </div>
        </div>
      `,
    };

    console.log('📧 [Item Email] Mail options prepared');
    console.log('📧 [Item Email] Attempting to send email...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Item Email] Email sent successfully!');
    console.log('✅ [Item Email] Message ID:', info.messageId);
    console.log('✅ [Item Email] Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('❌ [Item Email] FAILED TO SEND');
    console.error('❌ [Item Email] Error type:', error.name);
    console.error('❌ [Item Email] Error code:', error.code);
    console.error('❌ [Item Email] Error message:', error.message);
    
    if (error.response) {
      console.error('❌ [Item Email] SMTP Response:', error.response);
    }
    
    if (error.responseCode) {
      console.error('❌ [Item Email] SMTP Code:', error.responseCode);
    }
    
    console.error('❌ [Item Email] Full error:', error);
    
    return false;
  }
};

/**
 * Send Subscription Added Email
 */
exports.sendSubscriptionAddedEmail = async (userEmail, userName, subscriptionName, amount, renewalDate) => {
  try {
    console.log('📧 [Subscription Email] Starting email send process');
    console.log('📧 [Subscription Email] Target email:', userEmail);
    console.log('📧 [Subscription Email] User name:', userName);
    console.log('📧 [Subscription Email] Subscription:', subscriptionName);

    const renewalDateFormatted = new Date(renewalDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎟️ Subscription Added: ${subscriptionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📝 Subscription Added</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              Perfect! You've added a new subscription to your tracker.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Subscription Details:</h3>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Service:</strong> ${subscriptionName}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Amount:</strong> ₹${amount.toFixed(2)}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Next Renewal:</strong> ${renewalDateFormatted}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              We'll remind you before your next renewal. Manage all your subscriptions in one place with Expirio!
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              © 2026 Expirio. All rights reserved.<br>
              Made with ❤️ by Kiran Dekaliya
            </p>
          </div>
        </div>
      `,
    };

    console.log('📧 [Subscription Email] Mail options prepared');
    console.log('📧 [Subscription Email] Attempting to send email...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Subscription Email] Email sent successfully!');
    console.log('✅ [Subscription Email] Message ID:', info.messageId);
    console.log('✅ [Subscription Email] Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('❌ [Subscription Email] FAILED TO SEND');
    console.error('❌ [Subscription Email] Error type:', error.name);
    console.error('❌ [Subscription Email] Error code:', error.code);
    console.error('❌ [Subscription Email] Error message:', error.message);
    
    if (error.response) {
      console.error('❌ [Subscription Email] SMTP Response:', error.response);
    }
    
    if (error.responseCode) {
      console.error('❌ [Subscription Email] SMTP Code:', error.responseCode);
    }
    
    console.error('❌ [Subscription Email] Full error:', error);
    
    return false;
  }
};

/**
 * Send Expiry Reminder Email
 */
exports.sendExpiryReminderEmail = async (userEmail, userName, itemName, expiryDate, daysUntil) => {
  try {
    console.log('📧 [Expiry Reminder] Starting email send process');
    console.log('📧 [Expiry Reminder] Target email:', userEmail);
    console.log('📧 [Expiry Reminder] Item:', itemName);
    console.log('📧 [Expiry Reminder] Days until expiry:', daysUntil);

    const expiryDateFormatted = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let reminderMessage = '';
    let bgColor = '#28a745'; // green

    if (daysUntil < 0) {
      reminderMessage = `⚠️ EXPIRED ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`;
      bgColor = '#dc3545'; // red
    } else if (daysUntil === 0) {
      reminderMessage = '🔴 EXPIRES TODAY';
      bgColor = '#fd7e14'; // orange
    } else if (daysUntil === 1) {
      reminderMessage = '🟠 EXPIRES TOMORROW';
      bgColor = '#fd7e14'; // orange
    } else {
      reminderMessage = `🟡 EXPIRES IN ${daysUntil} DAYS`;
      bgColor = '#ffc107'; // yellow
    }

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `⏰ Reminder: ${itemName} ${daysUntil < 0 ? 'Expired' : 'Expiring Soon'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${bgColor}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${reminderMessage}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              This is a reminder that one of your tracked items is expiring soon!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${bgColor};">
              <h3 style="color: ${bgColor}; margin-top: 0;">Item Details:</h3>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Name:</strong> ${itemName}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Expiry Date:</strong> ${expiryDateFormatted}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              Please check this item and take action if needed. Open the Expirio app to manage your items.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              © 2026 Expirio. All rights reserved.<br>
              Made with ❤️ by Kiran Dekaliya
            </p>
          </div>
        </div>
      `,
    };

    console.log('📧 [Expiry Reminder] Mail options prepared');
    console.log('📧 [Expiry Reminder] Attempting to send email...');

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Expiry Reminder] Email sent successfully!');
    console.log('✅ [Expiry Reminder] Message ID:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ [Expiry Reminder] FAILED TO SEND');
    console.error('❌ [Expiry Reminder] Error type:', error.name);
    console.error('❌ [Expiry Reminder] Error message:', error.message);
    console.error('❌ [Expiry Reminder] Error code:', error.code);
    
    if (error.response) {
      console.error('❌ [Expiry Reminder] SMTP Response:', error.response);
    }
    
    console.error('❌ [Expiry Reminder] Full error:', error);
    
    return false;
  }
};

/**
 * Send Subscription Renewal Reminder Email
 */
exports.sendSubscriptionRenewalEmail = async (userEmail, userName, subscriptionName, amount, renewalDate, daysUntil) => {
  try {
    console.log('📧 [Subscription Renewal] Starting email send process');
    console.log('📧 [Subscription Renewal] Target email:', userEmail);
    console.log('📧 [Subscription Renewal] Subscription:', subscriptionName);
    console.log('📧 [Subscription Renewal] Days until renewal:', daysUntil);

    const renewalDateFormatted = new Date(renewalDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let reminderMessage = '';
    let bgColor = '#28a745'; // green

    if (daysUntil < 0) {
      reminderMessage = `⚠️ RENEWED ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`;
      bgColor = '#dc3545'; // red
    } else if (daysUntil === 0) {
      reminderMessage = '🔴 RENEWING TODAY';
      bgColor = '#fd7e14'; // orange
    } else if (daysUntil === 1) {
      reminderMessage = '🟠 RENEWING TOMORROW';
      bgColor = '#fd7e14'; // orange
    } else {
      reminderMessage = `🟡 RENEWING IN ${daysUntil} DAYS`;
      bgColor = '#ffc107'; // yellow
    }

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🔄 Reminder: ${subscriptionName} Renewing Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${bgColor}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${reminderMessage}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              This is a reminder that one of your subscriptions is renewing soon!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${bgColor};">
              <h3 style="color: ${bgColor}; margin-top: 0;">Subscription Details:</h3>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Service:</strong> ${subscriptionName}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Amount:</strong> ₹${amount.toFixed(2)}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 14px;">
                <strong>Renewal Date:</strong> ${renewalDateFormatted}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; font-size: 14px;">
              Make sure you have sufficient balance to avoid service interruption. Open the Expirio app to manage your subscriptions.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              © 2026 Expirio. All rights reserved.<br>
              Made with ❤️ by Kiran Dekaliya
            </p>
          </div>
        </div>
      `,
    };

    console.log('📧 [Subscription Renewal] Mail options prepared');
    console.log('📧 [Subscription Renewal] Attempting to send email...');

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Subscription Renewal] Email sent successfully!');
    console.log('✅ [Subscription Renewal] Message ID:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ [Subscription Renewal] FAILED TO SEND');
    console.error('❌ [Subscription Renewal] Error type:', error.name);
    console.error('❌ [Subscription Renewal] Error message:', error.message);
    console.error('❌ [Subscription Renewal] Error code:', error.code);
    
    if (error.response) {
      console.error('❌ [Subscription Renewal] SMTP Response:', error.response);
    }
    
    console.error('❌ [Subscription Renewal] Full error:', error);
    
    return false;
  }
};
