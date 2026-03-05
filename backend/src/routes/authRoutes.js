const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { sendItemAddedEmail } = require('../services/emailService');

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'expirio_secret_key_2024');
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Test email endpoint (for debugging)
// GET version - simpler for testing
router.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 [GET] Test email endpoint triggered');
    console.log('📧 Configuration check:');
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('   - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Missing');
    console.log('   - EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('   - EMAIL_PORT:', process.env.EMAIL_PORT);

    const testEmail = process.env.EMAIL_USER || 'test@example.com';
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'Email credentials not configured on server',
        details: {
          EMAIL_USER: process.env.EMAIL_USER ? 'Configured' : 'MISSING',
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configured' : 'MISSING'
        }
      });
    }

    console.log('🧪 Attempting to send test email to:', testEmail);
    const result = await sendItemAddedEmail(testEmail, 'Expirio User', 'Test Product', new Date());

    res.status(200).json({
      success: result,
      message: result ? 'Test email sent successfully to ' + testEmail : 'Failed to send test email',
      email: testEmail,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test email error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message,
      errorCode: error.code
    });
  }
});

// POST version - accepts custom email
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    console.log('🧪 [POST] Testing email to:', email);
    const result = await sendItemAddedEmail(email, name, 'Test Item', new Date());

    res.status(200).json({
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message,
      errorCode: error.code
    });
  }
});

module.exports = router;
