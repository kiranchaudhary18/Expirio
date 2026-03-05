import axios from 'axios';
import { Platform } from 'react-native';

/**
 * ⚠️ IMPORTANT - Configure your local machine IP address for real Android device on WiFi
 * 
 * To get your local IPv4 address:
 * - Windows: Open Command Prompt and run: ipconfig
 * - Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.x.x or 10.0.x.x)
 * 
 * Then replace the IP_ADDRESS below with your actual IP
 */
const IP_ADDRESS = '10.82.87.171'; // ← CHANGE THIS to your machine's IPv4 address
const PORT = 3002;
const API_ENDPOINT = `/api`;

// Construct API base URL based on platform
let API_BASE_URL = `http://localhost:${PORT}${API_ENDPOINT}`; // Default for web/iOS simulator

if (Platform.OS === 'android') {
  // For real Android device on WiFi - use your machine's IPv4 address
  // For Android emulator - use 10.0.2.2
  // You can modify this check if needed for your setup
  API_BASE_URL = `http://${IP_ADDRESS}:${PORT}${API_ENDPOINT}`;
}

// Override with environment variable if set
API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

console.log('📡 API_BASE_URL configured:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Using IP Address:', IP_ADDRESS);


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
