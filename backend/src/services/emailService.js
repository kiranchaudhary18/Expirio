const nodemailer = require('nodemailer');

// Log email configuration on startup
console.log('📧 Email Configuration:', {
  host: process.env.EMAIL_HOST || 'NOT SET',
  port: process.env.EMAIL_PORT || 'NOT SET',
  user: process.env.EMAIL_USER ? process.env.EMAIL_USER.split('@')[0] + '@...' : 'NOT SET',
  passwordSet: !!process.env.EMAIL_PASSWORD
});

// Primary transporter (TLS on port 587)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // false for TLS on port 587, true for SSL on port 465
  family: 4, // Force IPv4 only - CRITICAL for Render compatibility
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App Password, not regular password
  },
  // Increase timeouts significantly for Render deployment
  connectionTimeout: 20000, // 20 seconds
  socketTimeout: 20000,    // 20 seconds
  greetingTimeout: 20000,
  pool: true,              // Enable connection pooling
  maxConnections: 1,       // Use single connection
  maxMessages: 100
});

// Fallback transporter (SSL on port 465) - for cases where port 587 fails
const fallbackTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL on port 465
  family: 4, // Force IPv4 only
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 20000,
  socketTimeout: 20000,
  greetingTimeout: 20000,
  pool: true,              // Enable connection pooling
  maxConnections: 1,
  maxMessages: 100
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Service Configuration Error');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? 'Set' : 'Missing',
      password: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing'
    });
  } else {
    console.log('✅ Email Service Verified Successfully');
    console.log('✅ SMTP Connection Ready');
    console.log('Connected to:', process.env.EMAIL_HOST, 'on port', process.env.EMAIL_PORT);
  }
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

    const mailOptions = {
      from: `Expirio <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      ...(html && { html: html })
    };

    const result = await sendMailWithRetry(mailOptions, 3);

    if (result.success) {
      console.log('✅ [Generic Email] Sent successfully!');
      console.log('✅ [Generic Email] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Generic Email] Message ID:', result.info.messageId);
      return true;
    } else {
      console.error('❌ [Generic Email] Failed after retries');
      console.error('❌ Error code:', result.error.code);
      console.error('❌ Error message:', result.error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [Generic Email] Failed to send');
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    if (error.response) {
      console.error('❌ SMTP Response:', error.response);
    }

    return false;
  }
};

/**
 * Send email with retry logic and fallback transporter for better reliability on Render
 * @param {Object} mailOptions - Mail options for nodemailer
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} - Mail send result
 */
const sendMailWithRetry = async (mailOptions, retries = 3) => {
  // Try primary transporter first
  console.log('📧 Attempting with PRIMARY transporter (port 587, TLS)...');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📧 [Primary] Send attempt ${attempt}/${retries}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Primary] Email sent on attempt ${attempt}`);
      return { success: true, info, transporter: 'primary' };
    } catch (error) {
      console.error(`❌ [Primary] Attempt ${attempt} failed:`, error.code, '-', error.message);
      
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If primary fails all attempts, try FALLBACK transporter
  console.log('\n📧 Primary transporter failed. Attempting with FALLBACK transporter (port 465, SSL)...');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📧 [Fallback] Send attempt ${attempt}/${retries}...`);
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`✅ [Fallback] Email sent on attempt ${attempt}`);
      return { success: true, info, transporter: 'fallback' };
    } catch (error) {
      console.error(`❌ [Fallback] Attempt ${attempt} failed:`, error.code, '-', error.message);
      
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        return { success: false, error };
      }
    }
  }
};

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
    console.log('📧 [Welcome Email] Attempting to send email with retry logic...');
    
    const result = await sendMailWithRetry(mailOptions, 3);
    
    if (result.success) {
      console.log('✅ [Welcome Email] Email sent successfully!');
      console.log('✅ [Welcome Email] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Welcome Email] Message ID:', result.info.messageId);
      console.log('✅ [Welcome Email] Response:', result.info.response);
      return true;
    } else {
      console.error('❌ [Welcome Email] Failed after all retries (both PRIMARY and FALLBACK)');
      throw result.error;
    }
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
    console.log('📧 [Item Email] Attempting to send email with retry logic...');
    
    const result = await sendMailWithRetry(mailOptions, 3);
    
    if (result.success) {
      console.log('✅ [Item Email] Email sent successfully!');
      console.log('✅ [Item Added Email] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Item Added Email] Message ID:', result.info.messageId);
      console.log('✅ [Item Added Email] Response:', result.info.response);
      return true;
    } else {
      console.error('❌ [Item Added Email] Failed after all retries (both PRIMARY and FALLBACK)');
      throw result.error;
    }
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
    console.log('📧 [Subscription Email] Attempting to send email with retry logic...');
    
    const result = await sendMailWithRetry(mailOptions, 3);
    
    if (result.success) {
      console.log('✅ [Subscription Email] Email sent successfully!');
      console.log('✅ [Subscription Added Email] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Subscription Added Email] Message ID:', result.info.messageId);
      console.log('✅ [Subscription Added Email] Response:', result.info.response);
      return true;
    } else {
      console.error('❌ [Subscription Added Email] Failed after all retries (both PRIMARY and FALLBACK)');
      throw result.error;
    }
    
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
    console.log('📧 [Expiry Reminder] Attempting to send email with retry logic...');

    const result = await sendMailWithRetry(mailOptions, 3);
    
    if (result.success) {
      console.log('✅ [Expiry Reminder] Email sent successfully!');
      console.log('✅ [Expiry Reminder] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Expiry Reminder] Message ID:', result.info.messageId);
      return true;
    } else {
      console.error('❌ [Expiry Reminder] Failed after all retries (both PRIMARY and FALLBACK)');
      throw result.error;
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
    console.log('📧 [Subscription Renewal] Attempting to send email with retry logic...');

    const result = await sendMailWithRetry(mailOptions, 3);
    
    if (result.success) {
      console.log('✅ [Subscription Renewal] Email sent successfully!');
      console.log('✅ [Subscription Renewal] Transporter used:', result.transporter === 'fallback' ? 'FALLBACK (port 465)' : 'PRIMARY (port 587)');
      console.log('✅ [Subscription Renewal] Message ID:', result.info.messageId);
      return true;
    } else {
      console.error('❌ [Subscription Renewal] Failed after all retries (both PRIMARY and FALLBACK)');
      throw result.error;
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
