const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const itemRoutes = require('./src/routes/itemRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const { initializeSchedulers } = require('./src/services/schedulerService');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize email schedulers after database connection
    initializeSchedulers();
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api', itemRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Expirio Backend API is running',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Expirio Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
