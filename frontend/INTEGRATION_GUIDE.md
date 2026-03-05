# Expirio Frontend-Backend Integration Guide

## ✅ What's Been Set Up

### Authentication & User Management
- **AuthScreen**: Sign-up/Login screen with email-based authentication
- **Demo Mode**: Try the app without creating an account
- **User Persistence**: User data saved to AsyncStorage (userId, userName, userEmail)

### Frontend-Backend Connection
- **API Service**: Configured to connect to backend at `http://192.168.1.106:3002/api`
- **Item APIs**: Create, read, update, delete expiry items
- **Subscription APIs**: Create, read, update, delete subscriptions
- **User Association**: All items and subscriptions are tied to the logged-in user

### Connected Screens
1. **AuthScreen** - Users log in or sign up before using the app
2. **HomeScreen** - Fetches user's items from backend on load
3. **AddItemScreen** - Saves items to backend
4. **SubscriptionScreen** - Fetches and saves subscriptions from/to backend
5. **ProfileScreen** - Ready for logout functionality

---

## 🚀 How to Run

### Prerequisites
1. Node.js and npm installed
2. MongoDB running (local or MongoDB Atlas)
3. Backend server running on port 3002

### Step 1: Start the Backend
```bash
cd expirio/backend

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
```

Backend should be running on `http://localhost:3002`

### Step 2: Update Frontend IP Address

The frontend is configured to connect to `http://192.168.1.106:3002/api`. 

**Update this based on your setup:**

Edit [src/services/api.js](src/services/api.js):

```javascript
// For local testing on same machine:
const API_BASE_URL = 'http://localhost:3002/api';

// For testing on actual device:
const API_BASE_URL = 'http://192.168.x.x:3002/api';  // Use your machine's IP
```

**Find your IP address:**
- Windows: `ipconfig` in Command Prompt
- Mac/Linux: `ifconfig` in Terminal

### Step 3: Start the Frontend
```bash
cd expirio/frontend

# Install dependencies (if not done)
npm install

# For Expo (React Native)
npx expo start

# Scan QR code with Expo Go app or press 'i' for iOS / 'a' for Android
```

---

## 📱 How to Use the App

### First Time Users

1. **Sign Up**
   - Tap "Sign Up" on the login screen
   - Enter your name, email, and password
   - Tap "Create Account"
   - Data is automatically saved to backend

2. **Or Try Demo Mode**
   - Tap "Try Demo Mode" to use sample data
   - No login required
   - Data is saved locally but not synced to backend

### Adding Items

1. Go to **Home** tab
2. Tap **"+"** button or **"Add New Item"**
3. Fill in:
   - Item Name (required)
   - Category (required)
   - Expiry Date (required)
   - Reminder Days
   - Notes (optional)
   - Item Image (optional)
4. Tap **"Save Item"**
5. Item is saved to backend and synced to MongoDB

### Managing Subscriptions

1. Go to **Subscriptions** tab
2. Tap **"+"** to add new subscription
3. Fill in:
   - Subscription Name (required)
   - Renewal Date (required)
   - Amount (required)
   - Renewal Reminder Days
4. Tap **"Save Subscription"**
5. Subscription is saved to backend

### Viewing Items

- **Home Screen**: Shows all your items sorted by expiry date
- **Filter**: By status (all, expired, expiringSoon, safe)
- **Search**: Find items by name or category
- **Pull to Refresh**: Syncs with backend

---

## 🔌 API Endpoints

### Items
- `POST /api/items` - Create item
- `GET /api/items/:userId` - Get all items
- `GET /api/item/:id` - Get single item
- `PUT /api/item/:id` - Update item
- `DELETE /api/item/:id` - Delete item

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/:userId` - Get all subscriptions
- `PUT /api/subscription/:id` - Update subscription
- `DELETE /api/subscription/:id` - Delete subscription

---

## 💾 Data Flow

```
Frontend              Backend              MongoDB
---------            --------             --------
  User
    |
    v
  Login/SignUp
    |
    v
  Store userId in AsyncStorage
    |
    v (userId)
  Add Item ---------> /api/items --------> Save to DB
    |
    v (userId) 
  Fetch Items -------> /api/items/:userId -> Read from DB
    |
    v
  Display Items
```

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=3002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expirio
NODE_ENV=development
```

### Frontend API Service (api.js)
```javascript
const API_BASE_URL = 'http://192.168.1.106:3002/api';
```

---

## 🐛 Troubleshooting

### "Failed to save item" Error
- **Check**: Backend is running on port 3002
- **Check**: MongoDB connection is active
- **Check**: API_BASE_URL is correct in api.js
- **Check**: User is logged in (userId exists)

### Items not appearing after creation
- **Check**: API response is successful (check console)
- **Check**: Pull to refresh on Home screen
- **Check**: user ID matches between frontend and backend

### Backend connection fails
1. Verify backend is running: `npm run dev`
2. Check MongoDB connection string in .env
3. Verify port 3002 is not blocked
4. Check API_BASE_URL matches your IP/port

### AsyncStorage errors
- Clear app cache: Settings → Apps → Expirio → Clear Cache
- Reinstall the app
- Check permissions are granted

---

## 📚 File Structure

```
frontend/
├── App.js                          # Main app with auth flow
├── src/
│   ├── services/
│   │   └── api.js                 # Backend API configuration
│   ├── screens/
│   │   ├── AuthScreen.js          # NEW: Login/Signup
│   │   ├── HomeScreen.js          # UPDATED: Fetch from backend
│   │   ├── AddItemScreen.js       # UPDATED: Save to backend
│   │   ├── SubscriptionScreen.js  # UPDATED: Sync with backend
│   │   └── others...
│   └── components/
│       └── CustomButton.js        # Reusable button
```

---

## ✨ Features Implemented

✅ **Authentication**
- Sign up with email/password
- Login to existing account
- Demo mode for testing
- User data persistence

✅ **Item Management**
- Create items with backend sync
- Auto-calculate expiry status
- Fetch items from backend
- Filter and search
- Pull to refresh

✅ **Subscription Management**
- Add subscriptions
- Track renewal dates
- Backend synchronization
- Display total monthly cost

✅ **Real-time Sync**
- Items saved to MongoDB
- Subscriptions tracked
- User isolation (userId-based)
- Automatic status calculation

---

## 🔐 Security Notes

### Current Implementation
- Simple email-based userId (demo only)
- No password validation
- For development/testing only

### For Production
- Implement JWT authentication
- Validate passwords securely
- Add token-based API authentication
- Encrypt sensitive data
- Implement rate limiting
- Add input validation on backend

---

## 🎯 Next Steps

1. **Run the app**: Start both backend and frontend
2. **Create an account**: Sign up with email
3. **Add items**: Create a few test items
4. **Check MongoDB**: Verify data is saved
5. **Test sync**: Pull to refresh to see updates

---

## 📞 Support

### Check Logs
- **Frontend**: Open browser console or use `console.log` in React Native
- **Backend**: Check terminal where server is running
- **MongoDB**: Check Atlas dashboard for collections

### Common Issues
1. **Port already in use**: Change PORT in .env
2. **Connection refused**: Verify backend is running
3. **MongoDB error**: Check connection string
4. **CORS error**: Backend has CORS enabled
5. **AsyncStorage error**: Clear app and reinstall

---

## 🚀 You're All Set!

Your Expirio app is now fully connected. Users can:
- Sign up/login
- Add expiry items
- Manage subscriptions
- All data is saved to MongoDB

Happy tracking! 🎉

---

**Backend**: [expirio/backend/README.md](../backend/README.md)
**Created**: February 23, 2026
