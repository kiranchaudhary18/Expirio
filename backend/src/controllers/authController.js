const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'expirio_secret_key_2024', {
    expiresIn: '30d'
  });
};

// Register new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Send welcome email (asynchronously - don't wait)
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('⚠️  Welcome email failed to send in background:', err.message);
    });

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          emailNotifications: user.emailNotifications
        },
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          emailNotifications: user.emailNotifications
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, emailNotifications, reminderTime, avatar } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (reminderTime !== undefined) updateData.reminderTime = reminderTime;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Profile updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Google Login/Signup
exports.googleLogin = async (req, res) => {
  try {
    const { name, email, googleId, photo } = req.body;

    // Validate input
    if (!name || !email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and googleId'
      });
    }

    // Check if user already exists with this email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - just login
      console.log(`✅ User logged in with Google: ${email}`);
      
      // Update googleId and photo if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.photo = photo || user.photo;
        await user.save();
      }
    } else {
      // User doesn't exist - create new account
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        photo: photo || null,
        // No password for Google login users
      });

      await user.save();
      console.log(`✅ New user created with Google: ${email}`);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photo: user.photo,
          googleId: user.googleId,
          emailNotifications: user.emailNotifications
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error with Google login',
      error: error.message
    });
  }
};
