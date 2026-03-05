# Expirio - Quick Start Guide

## 🚀 Get Everything Running in 5 Minutes

This guide will help you set up and run both frontend and backend.

---

## ✅ Prerequisites

Before starting, make sure you have:

1. **Node.js & npm** - [Download here](https://nodejs.org/)
   - Verify: `node -v` and `npm -v`

2. **MongoDB** - Choose one:
   - **Local MongoDB**: [Download Community Edition](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud - No installation needed): [Create Free Account](https://www.mongodb.com/cloud/atlas)

3. **Expo CLI** - For running React Native app:
   ```bash
   npm install -g expo-cli
   ```

4. **Expo Go App** - Download on your phone to preview the app

---

## 🔧 Setup Steps

### 1️⃣ Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (free tier available)
4. Create a database user with password
5. Get connection string (starts with `mongodb+srv://`)
6. Copy the connection string

#### Option B: Local MongoDB
```bash
# Windows - Run MongoDB
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2️⃣ Setup Backend

```bash
# Navigate to backend
cd expirio/backend

# Install dependencies
npm install

# Create/Update .env file with your MongoDB connection
# Backend/.env should contain:
PORT=3002
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development

# Start the server
npm run dev
```

✅ **Backend should show**: `Expirio Backend Server running on port 3002`

### 3️⃣ Setup Frontend

```bash
# Navigate to frontend
cd expirio/frontend

# Install dependencies
npm install

# Update API URL in src/services/api.js
# Change: const API_BASE_URL = 'http://YOUR_IP:3002/api';
# If local: 'http://localhost:3002/api'
# If remote: 'http://192.168.x.x:3002/api' (get IP from ipconfig/ifconfig)

# Start the app
npx expo start
```

✅ **Expo should show**: QR code and options to run on iOS/Android

---

## 📱 Run the App

### On Your Phone
1. Download **Expo Go** app from AppStore/PlayStore
2. Scan the QR code from Expo terminal
3. App loads on your phone

### On Emulator
- Press `i` for iOS emulator (Mac only)
- Press `a` for Android emulator

---

## 🧪 Test the App

1. **App Opens** → Splash screen shows "Expirio"
2. **Login Screen** → See sign-up/login form
3. **Try Demo** → Click "Try Demo Mode" to test without account
4. **Sign Up** → Create account with email/password
5. **Add Item**:
   - Tap `+` button
   - Fill in item details (name, category, expiry date)
   - Tap "Save Item" → Item saves to backend
6. **Check Backend** → View MongoDB to confirm data saved
7. **Add Subscription** → Similar process for subscriptions

---

## 🔍 Verify Everything Works

### Check Backend
```bash
# Terminal where backend is running should show:
Expirio Backend Server running on port 3002
MongoDB connected successfully
```

### Check Frontend Connection
1. Open app
2. Create an item
3. Check browser console/terminal for API logs
4. Should NOT see "Failed to connect" errors

### Check MongoDB
Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and:
1. Go to Collections
2. Find database "expirio"
3. Should see "items" and "subscriptions" collections
4. Click to view saved data

---

## ⚙️ Common Issues & Solutions

### ❌ "Failed to connect to backend"
**Solution:**
- Verify backend is running: see `npm run dev` output
- Check port 3002 is not blocked
- Update API_BASE_URL in `src/services/api.js`
- Verify MongoDB connection string in `.env`

### ❌ "Port 3002 already in use"
**Solution:**
- Change PORT in `backend/.env` to another port (e.g., 3001)
- Update frontend API_BASE_URL accordingly

### ❌ "MongoDB connection failed"
**Solution:**
- For Atlas: Verify connection string in `.env`
- For Local: Ensure `mongod` is running
- Check username/password in connection string
- Check IP whitelist in MongoDB Atlas

### ❌ "Expo app won't load"
**Solution:**
- Clear Expo cache: `expo start --clear`
- Reinstall Expo Go app
- Verify phone and computer on same WiFi

### ❌ "Item not saving to backend"
**Solution:**
- Check user is logged in (has userId)
- Check backend logs for errors
- Verify MongoDB is running
- Check network connection

---

## 📝 File Locations

```
expirio/
├── backend/
│   ├── .env                    ← Update with MongoDB URI
│   ├── server.js              ← Main server file
│   ├── package.json           ← Dependencies
│   └── src/                   ← API controllers, models, routes
│
└── frontend/
    ├── App.js                      ← Main app file (auth flow)
    ├── package.json                ← Dependencies
    └── src/
        ├── services/
        │   └── api.js             ← Update API_BASE_URL here
        └── screens/
            ├── AuthScreen.js       ← Login/Signup
            ├── HomeScreen.js       ← Items list
            ├── AddItemScreen.js    ← Create items
            └── SubscriptionScreen.js ← Manage subscriptions
```

---

## 🎯 What to Expect

### First Load
1. Splash screen (2.5 seconds)
2. Login screen appears
3. Can sign up or use Demo Mode

### After Login
1. Home screen with your items
2. If you create items, they appear here
3. Pull to refresh to sync from backend

### Data Flow
```
Phone App
   ↓ (userId)
Frontend makes API call
   ↓
Backend (port 3002)
   ↓
MongoDB Database
   ↓ Returns data
Frontend displays items
```

---

## 🧩 Feature Checklist

- ✅ User authentication (sign up/login)
- ✅ Create expiry items
- ✅ Auto-calculates expiry status (expired/expiring soon/safe)
- ✅ Manage subscriptions
- ✅ Pull to refresh items
- ✅ Search and filter items
- ✅ Delete items
- ✅ All data saved to MongoDB
- ✅ Multi-user support (userId-based)

---

## 📚 Documentation

- **Backend Setup**: See [backend/README.md](../backend/README.md)
- **Backend Installation**: See [backend/INSTALL.md](../backend/INSTALL.md)
- **Frontend Integration**: See [frontend/INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

---

## 🆘 Need Help?

### Check Logs
1. **Backend Terminal** - Shows server errors
2. **Expo Terminal** - Shows app errors
3. **Browser Console** - Shows API errors (if using web)

### Common Log Messages

**Good** ✅
```
Expirio Backend Server running on port 3002
MongoDB connected successfully
```

**Bad** ❌
```
Failed to connect to MongoDB
EADDRINUSE: address already in use :::3002
Error: Cannot find module 'express'
```

---

## 🚀 You're Ready!

Your Expirio app is now:
- ✅ Frontend ready to use
- ✅ Backend API connected
- ✅ MongoDB database ready
- ✅ Authentication working

**Start the app and begin tracking expiry dates!** 🎉

---

## 📞 Quick Reference

| What | How |
|------|-----|
| **Start Backend** | `npm run dev` (in backend folder) |
| **Start Frontend** | `npx expo start` (in frontend folder) |
| **Check Backend Running** | Visit `http://localhost:3002/api/health` |
| **View MongoDB Data** | Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| **Reload App** | Press `R` in Expo terminal |
| **Clear Cache** | `expo start --clear` |
| **Device IP** | `ipconfig` (Windows) or `ifconfig` (Mac/Linux) |

---

**Version**: 1.0  
**Updated**: February 23, 2026  
**Status**: Ready to Use 🚀
