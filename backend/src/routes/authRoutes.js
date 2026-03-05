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
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    console.log('🧪 Testing email to:', email);
    const result = await sendItemAddedEmail(email, name, 'Test Item', new Date());

    res.status(200).json({
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
      email: email
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

module.exports = router;
