const sendEmail = require('../utils/sendEmail');

// Log email configuration on startup
console.log('📧 Email Configuration (Resend):', {
  apiKeySet: !!process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'noreply@resend.dev'
});

/**
 * Generic reusable email function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body (optional)
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
exports.sendEmail = async (to, subject, text, html = null) => {
  try {
    console.log('📧 [Generic Email] Sending to:', to);
    console.log('📧 [Generic Email] Subject:', subject);

    const emailHtml = html || `<p>${text}</p>`;
    const result = await sendEmail(to, subject, emailHtml);

    if (result.success) {
      console.log('✅ [Generic Email] Email sent successfully!');
      console.log('✅ [Generic Email] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Generic Email] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [Generic Email] Failed to send');
    console.error('❌ Error:', error.message);
    return false;
  }
};

/**
 * Send Welcome Email
 */
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('📧 [Welcome Email] Starting email send process');
    console.log('📧 [Welcome Email] Target email:', userEmail);
    console.log('📧 [Welcome Email] User name:', userName);

    const htmlContent = `
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
    `;

    const result = await sendEmail(userEmail, '🎉 Welcome to Expirio - Your Smart Expiry Tracker', htmlContent);

    if (result.success) {
      console.log('✅ [Welcome Email] Email sent successfully!');
      console.log('✅ [Welcome Email] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Welcome Email] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [Welcome Email] FAILED TO SEND');
    console.error('❌ Error:', error.message);
    return false;
  }
};

/**
 * Send Item Added Email
 */
exports.sendItemAddedEmail = async (userEmail, userName, itemName, expiryDate) => {
  try {
    console.log('📧 [Item Email] Starting email send process');
    console.log('📧 [Item Email] Target email:', userEmail);
    console.log('📧 [Item Email] User name:', userName);
    console.log('📧 [Item Email] Item:', itemName);
    
    const expiryDateFormatted = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
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
    `;

    const result = await sendEmail(userEmail, `✅ Item Added: ${itemName}`, htmlContent);

    if (result.success) {
      console.log('✅ [Item Email] Email sent successfully!');
      console.log('✅ [Item Email] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Item Email] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [Item Email] FAILED TO SEND');
    console.error('❌ Error:', error.message);
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

    const htmlContent = `
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
    `;

    const result = await sendEmail(userEmail, `🎟️ Subscription Added: ${subscriptionName}`, htmlContent);

    if (result.success) {
      console.log('✅ [Subscription Email] Email sent successfully!');
      console.log('✅ [Subscription Email] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Subscription Email] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [Subscription Email] FAILED TO SEND');
    console.error('❌ Error:', error.message);
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

    const htmlContent = `
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
    `;

    const result = await sendEmail(userEmail, `⏰ Reminder: ${itemName} ${daysUntil < 0 ? 'Expired' : 'Expiring Soon'}`, htmlContent);

    if (result.success) {
      console.log('✅ [Expiry Reminder] Email sent successfully!');
      console.log('✅ [Expiry Reminder] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Expiry Reminder] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
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

    const htmlContent = `
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
    `;

    const result = await sendEmail(userEmail, `🔄 Reminder: ${subscriptionName} Renewing Soon`, htmlContent);

    if (result.success) {
      console.log('✅ [Subscription Renewal] Email sent successfully!');
      console.log('✅ [Subscription Renewal] Message ID:', result.messageId);
      return true;
    } else {
      console.error('❌ [Subscription Renewal] Failed to send');
      console.error('❌ Error:', result.error);
      return false;
    }
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
