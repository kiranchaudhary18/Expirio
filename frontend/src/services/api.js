import axios from 'axios';
import { Platform } from 'react-native';

// ============================================
// 🔄 API ENVIRONMENT SELECTION
// ============================================
// Change this to 'production' or 'development'
const API_MODE = 'production'; // ← TOGGLE THIS: 'production' or 'development'

// Production URL (Render deployment)
const PRODUCTION_API = 'https://expirio-back.onrender.com/api';

// Development URL (Local machine)
const LOCAL_IP_ADDRESS = '0.122.118.171'; // ← Update to your machine's IPv4 (run: ipconfig)
const LOCAL_PORT = 3002;
const LOCAL_DEV_API = `http://localhost:${LOCAL_PORT}/api`; // Default for web/iOS simulator

// Determine API_BASE_URL based on mode
let API_BASE_URL;

if (API_MODE === 'production') {
  // Using production deployment
  API_BASE_URL = PRODUCTION_API;
  console.log('🚀 PRODUCTION MODE: Using Render deployment');
} else {
  // Using local development
  API_BASE_URL = LOCAL_DEV_API; // Default for web/iOS simulator

  if (Platform.OS === 'android') {
    // For real Android device on WiFi - use your machine's IPv4 address
    // For Android emulator - use 10.0.2.2
    API_BASE_URL = `http://${LOCAL_IP_ADDRESS}:${LOCAL_PORT}/api`;
  }
  
  console.log('🛠️ DEVELOPMENT MODE: Using local backend');
}

// Override with environment variable if set (useful for CI/CD)
API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

console.log('📡 API_BASE_URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // You can add auth token here when backend is ready
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Call Failed', {
      baseURL: API_BASE_URL,
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.message,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
    });
    
    if (error.response) {
      // Server responded with error status
      console.error('📡 Server Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('🌐 Network Error - No response from server:', error.message);
      console.error('📋 Request details:', {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else {
      console.error('⚠️ Client Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Item API endpoints
export const itemAPI = {
  // Create new item
  createItem: (userId, itemData) => api.post('/items', {
    userId,
    ...itemData
  }),

  // Get all items for a user
  getItemsByUserId: (userId) => api.get(`/items/${userId}`),

  // Get single item by ID
  getItemById: (id) => api.get(`/item/${id}`),

  // Update item
  updateItem: (id, itemData) => api.put(`/item/${id}`, itemData),

  // Delete item
  deleteItem: (id) => api.delete(`/item/${id}`),
};

// Subscription API endpoints
export const subscriptionAPI = {
  // Get all subscriptions
  getSubscriptions: () => api.get('/subscriptions'),

  // Get single subscription by ID
  getSubscription: (id) => api.get(`/subscription/${id}`),

  // Create new subscription with userId
  createSubscription: (userId, subscriptionData) => api.post('/subscriptions', {
    userId,
    ...subscriptionData
  }),

  // Get all subscriptions for a user
  getSubscriptionsByUserId: (userId) => api.get(`/subscriptions/${userId}`),

  // Update subscription (For future authentication)
  updateSubscription: (id, subscriptionData) => api.put(`/subscription/${id}`, subscriptionData),

  // Delete subscription
  deleteSubscription: (id) => api.delete(`/subscription/${id}`),
};

// User API endpoints
export const userAPI = {
  // Signup/Register
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),

  // Login
  login: (email, password) => api.post('/auth/login', { email, password }),

  // Google Login/Signup
  googleLogin: (name, email, googleId, photo) => api.post('/auth/google', { 
    name, 
    email, 
    googleId, 
    photo 
  }),

  // Get user profile (requires token)
  getProfile: (token) => api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // Update user profile (requires token)
  updateProfile: (token, data) => api.put('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export default api;





