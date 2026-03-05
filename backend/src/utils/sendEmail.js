const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail(to, subject, html) {
  try {
    console.log('📧 [Resend] Sending email');
    console.log('📧 [Resend] From:', process.env.EMAIL_FROM);
    console.log('📧 [Resend] To:', to);
    console.log('📧 [Resend] Subject:', subject);
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: html
    });

    // Check if email actually sent or if there's an error in response
    if (result.error) {
      console.error('❌ [Resend] API returned error');
      console.error('❌ [Resend] Error:', result.error);
      return {
        success: false,
        error: result.error
      };
    }

    if (!result.id) {
      console.error('❌ [Resend] No message ID returned');
      console.error('❌ [Resend] Response:', JSON.stringify(result));
      return {
        success: false,
        error: 'No message ID in response'
      };
    }

    console.log('✅ [Resend] Email sent successfully!');
    console.log('✅ [Resend] Message ID:', result.id);
    
    return {
      success: true,
      messageId: result.id
    };
  } catch (error) {
    console.error('❌ [Resend] Email sending failed');
    console.error('❌ [Resend] Error type:', error.name);
    console.error('❌ [Resend] Error message:', error.message);
    console.error('❌ [Resend] Full error:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = sendEmail;
