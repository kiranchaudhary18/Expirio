# 🏷️ EXPIRIO - Smart Expiry Tracker

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-orange?style=flat-square)
![Node](https://img.shields.io/badge/Node-14+-green?style=flat-square)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square)

**Never worry about expired products again! 🚀**

*A smart, AI-powered mobile app that tracks expiry dates, sends timely reminders, and helps reduce waste.*

[Demo](#-demo) • [Features](#-features) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 What is Expirio?

**Expirio** is an intelligent expiry tracking solution designed for modern households and businesses. Scan barcodes, get instant product information, set reminders, and manage your inventory—all from your phone!

Whether you're tracking groceries, medicines, cosmetics, or subscriptions, Expirio keeps everything organized and sends you smart notifications before items expire.

---

## 📋 Quick Navigation

| Section | Link |
|---------|------|
| Features | [View Features](#-features) |
| Tech Stack | [View Stack](#-tech-stack) |
| Installation | [View Setup](#-installation) |
| API Reference | [View Docs](#-api-documentation) |
| Database | [View Models](#-database-models) |
| Troubleshooting | [View Help](#-troubleshooting) |
| Contributing | [View Guide](#-contributing) |

---

## ✨ Premium Features

### 🎁 Core Capabilities
<table>
<tr>
<td width="50%">

**📱 Smart Inventory**
- Real-time item tracking
- Visual status indicators
- Organized by categories
- Quick item search

</td>
<td width="50%">

**🔔 Intelligent Alerts**
- Customizable reminders
- Email notifications
- Scheduled alerts
- Smart timing

</td>
</tr>
<tr>
<td width="50%">

**🏷️ Barcode Scanning**
- Instant product lookup
- Auto-fill product info
- Barcode database access
- Manual entry option

</td>
<td width="50%">

**👤 User Authentication**
- Email/Password signup
- Google OAuth support
- JWT security
- Profile management

</td>
</tr>
<tr>
<td width="50%">

**💳 Subscription Mgmt**
- Track subscriptions
- Renewal reminders
- Cost tracking
- Status management

</td>
<td width="50%">

**📊 Smart Analytics**
- Expiry dashboard
- Categorized view
- Status breakdown
- Usage insights

</td>
</tr>
</table>

### 🚀 Advanced Features

| Feature | Details |
|---------|---------|
| 🔐 **Multi-Auth** | Email/Password + Google OAuth with JWT tokens |
| 📧 **Email System** | Automated scheduled reminders using node-cron |
| 🗄️ **Smart Database** | MongoDB with sophisticated status calculation |
| 🎨 **Theme Support** | Dark/Light themes with React Context |
| 🌍 **Cross-Platform** | Android, iOS, and Web support via Expo |
| ⚡ **Real-time** | Instant status updates and notifications |
| 🛡️ **Secure** | Password hashing, JWT validation, CORS protection |

---

## 🏗️ Architecture & Structure

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPIRIO ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   React Native   │         │   Express.js     │        │
│  │  Mobile App      │◄───────►│   API Server     │        │
│  │  (Android/iOS)   │  HTTP   │   (Port 3002)    │        │
│  └──────────────────┘         └──────────────────┘        │
│         ▲                             ▲                    │
│         │                             │                    │
│    ┌────┴──────────────────────────────┴───┐              │
│    │   JWT Authentication & CORS Enabled   │              │
│    └────┬──────────────────────────────────┤              │
│         │                                  │              │
│    ┌────▼──────────┐              ┌───────▼──────┐       │
│    │  MongoDB      │              │  Nodemailer  │       │
│    │  Database     │              │  Email       │       │
│    └───────────────┘              └──────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        Background Tasks (node-cron) ⏰
        Scheduled Email Reminders 📧
```

### 📁 Project Structure

```
Expirio/
├── 📄 README.md (This file)
├── 📄 API_DOCUMENTATION.md (Complete API Reference)
├── 📄 POSTMAN_COLLECTION.json (API Testing Collection)
│
├── 📦 backend/ (Express.js REST API)
│   ├── 🎮 server.js (Main Entry Point)
│   ├── 📋 package.json
│   │
│   └── 📁 src/
│       ├── 🎯 controllers/ (Business Logic)
│       │   ├── authController.js (Auth operations)
│       │   ├── itemController.js (Item CRUD)
│       │   ├── productController.js (Product search)
│       │   └── subscriptionController.js (Subscriptions)
│       │
│       ├── 🗄️ models/ (MongoDB Schemas)
│       │   ├── User.js (User data)
│       │   ├── Item.js (Tracked items)
│       │   ├── Product.js (Product catalog)
│       │   └── Subscription.js (Subscriptions)
│       │
│       ├── 🛣️ routes/ (API Endpoints)
│       │   ├── authRoutes.js
│       │   ├── itemRoutes.js
│       │   ├── productRoutes.js
│       │   └── subscriptionRoutes.js
│       │
│       ├── 🔐 middleware/
│       │   └── auth.js (JWT Verification)
│       │
│       ├── ⚙️ services/ (Core Services)
│       │   ├── emailService.js (Email templates)
│       │   └── schedulerService.js (Cron jobs)
│       │
│       └── 🛠️ utils/ (Helpers)
│           ├── helpers.js
│           └── sendEmail.js
│
└── 📱 frontend/ (React Native Expo App)
    ├── 🎨 App.js (Root Component)
    ├── 📋 package.json
    ├── 📋 app.json (Expo config)
    │
    └── 📁 src/
        ├── 🧩 components/ (Reusable UI)
        │   ├── CustomButton.js
        │   ├── ItemCard.js
        │   └── DashboardCard.js
        │
        ├── 📺 screens/ (App Pages)
        │   ├── 🔐 AuthScreen.js
        │   ├── 📝 LoginScreen.js
        │   ├── 📝 SignupScreen.js
        │   ├── 🏠 HomeScreen.js (Dashboard)
        │   ├── ➕ AddItemScreen.js
        │   ├── 📸 ScannerScreen.js (Barcode)
        │   ├── 👤 ProfileScreen.js
        │   ├── ⚙️ EditProfileScreen.js
        │   ├── 💳 SubscriptionScreen.js
        │   ├── ❓ HelpCenterScreen.js
        │   ├── 📞 ContactSupportScreen.js
        │   └── 🔒 PrivacyPolicyScreen.js
        │
        ├── 🧭 navigation/
        │   └── BottomTabNavigator.js
        │
        ├── 🎨 context/
        │   └── ThemeContext.js (Theme state)
        │
        ├── 🌐 services/
        │   └── api.js (Axios instance)
        │
        └── 🛠️ utils/
            └── colors.js (Color constants)
```

---

## 🛠️ Tech Stack

### 🖥️ Backend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 14+ | JavaScript runtime |
| **Framework** | Express.js | 4.18+ | Web server & routing |
| **Database** | MongoDB | 7.0+ | NoSQL database |
| **ODM** | Mongoose | 7.0+ | MongoDB ODM |
| **Auth** | JWT | 9.0.3 | Token-based auth |
| **Security** | bcryptjs | 3.0.3 | Password hashing |
| **Email** | Nodemailer | 8.0.1 | Email service |
| **Email (Alt)** | Resend | 6.9.3 | Alternative email |
| **Scheduling** | node-cron | 4.2.1 | Task scheduling |
| **CORS** | cors | 2.8.5 | Cross-origin requests |
| **Config** | dotenv | 16.0.3 | Environment variables |
| **DevTools** | nodemon | 2.0.22 | Auto-reload dev |

### 📱 Frontend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React Native | 0.81 | Mobile UI |
| **Build Tool** | Expo | 54.0 | Project scaffolder |
| **HTTP** | Axios | 1.13.6 | API requests |
| **Navigation** | React Navigation | 7.1+ | App routing |
| **State Mgmt** | Context API | Built-in | Global state |
| **Storage** | AsyncStorage | 2.2.0 | Local storage |
| **Camera** | Expo Camera | 17.0.8 | Barcode scanning |
| **UI** | Native Components | Built-in | iOS/Android UI |
| **Icons** | Expo Icons | 15.0.3 | Icon library |
| **DateTime** | DateTimePicker | 8.4.4 | Date selection |
| **Notifications** | Expo Notifications | 0.32.16 | Push alerts |

### 🔌 Integration APIs

- **Google OAuth**: For external authentication
- **Nodemailer SMTP**: For email delivery
- **MongoDB Atlas**: Cloud database (optional)
- **Barcode APIs**: For product lookup

---

## 🚀 Installation & Setup

### 📋 Prerequisites

Before you begin, ensure you have installed:

```bash
✅ Node.js (v14 or higher)
✅ MongoDB (Local or Atlas cloud database)
✅ Expo CLI (npm install -g expo-cli)
✅ Android Studio or Xcode (for mobile emulation)
✅ Git (for version control)
✅ Postman (optional, for API testing)
```

**Verify Installation:**
```bash
node --version       # Should be v14+
npm --version        # Should be v6+
expo --version       # Should be 54.0+
```

---

### 🖥️ Backend Setup Guide

#### Step 1️⃣: Navigate & Install

```bash
cd backend
npm install
```

#### Step 2️⃣: Configure Environment

Create `.env` file in `backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/expirio

# Security
JWT_SECRET=your_super_secret_jwt_key_2024
NODE_ENV=development

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Server
PORT=3002
```

**📝 Email Setup Help:**
1. Enable 2FA in Gmail
2. Generate App-Specific Password
3. Use that password in EMAIL_PASSWORD

#### Step 3️⃣: Start Backend

```bash
# Development Mode (with auto-reload)
npm run dev

# Production Mode
npm start
```

✅ Server running at: `http://localhost:3002`

**Test Health:**
```bash
curl http://localhost:3002/api/health
```

---

### 📱 Frontend Setup Guide

#### Step 1️⃣: Navigate & Install

```bash
cd frontend
npm install
```

#### Step 2️⃣: Configure Constants

Update API endpoint in `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:3002/api'; // For local testing
// For production: 'https://your-domain.com/api'
```

#### Step 3️⃣: Start Development Server

```bash
npm start
```

#### Step 4️⃣: Choose Your Platform

```bash
# Android (Emulator or Device)
npm run android

# iOS (Mac only)
npm run ios

# Web Browser
npm run web

# Or press: a for Android, i for iOS, w for Web
```

**📲 First Time Setup:**
- Install Expo Go app from Play Store / App Store
- Scan QR code from terminal
- App will load in Expo Go

---

## 🔑 Environment Variables Reference

### Backend (.env)

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `MONGODB_URI` | URL | `mongodb://localhost:27017/expirio` | ✅ Yes |
| `JWT_SECRET` | String | `secret_key_123` | ✅ Yes |
| `EMAIL_USER` | Email | `your@gmail.com` | ⚠️ For emails |
| `EMAIL_PASSWORD` | Password | `xxxx xxxx xxxx xxxx` | ⚠️ For emails |
| `EMAIL_HOST` | URL | `smtp.gmail.com` | ⚠️ For emails |
| `EMAIL_PORT` | Number | `587` | ⚠️ For emails |
| `NODE_ENV` | String | `development` | ✅ Yes |
| `PORT` | Number | `3002` | ✅ Yes |

### Frontend (.env or in code)

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `API_URL` | URL | `http://localhost:3002/api` | ✅ Yes |

---

## 💻 Running Full Stack

### Development Setup (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output: Expirio Backend Server running on port 3002
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Press: a for Android, w for Web
```

### Quick Commands Cheatsheet

```bash
# Backend
cd backend && npm install       # Install deps
npm run dev                     # Start dev server
npm start                       # Start production
npm run test                    # Run tests

# Frontend  
cd frontend && npm install      # Install deps
npm start                       # Start Expo
npm run android                 # Launch Android
npm run web                     # Launch Web
expo start --clear              # Clear cache

# Database
mongo                           # Connect to MongoDB
show dbs                        # List databases
use expirio                     # Switch database
db.users.find()                 # View users
```

---

## 📚 API Documentation

### 🌐 API Overview

| Category | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **Auth** | POST | `/auth/signup` | Register new user |
| | POST | `/auth/login` | User login |
| | POST | `/auth/google` | Google OAuth |
| | GET | `/auth/profile` | Get user profile |
| | PUT | `/auth/profile` | Update profile |
| **Items** | POST | `/items` | Create item |
| | GET | `/items/:userId` | Get user items |
| | GET | `/item/:id` | Get item details |
| | PUT | `/item/:id` | Update item |
| | DELETE | `/item/:id` | Delete item |
| **Products** | GET | `/products/barcode/:barcode` | Barcode lookup |
| | GET | `/products/search/:query` | Search products |
| | GET | `/products` | Get all products |
| | POST | `/products` | Create product |
| **Subscriptions** | POST | `/subscriptions` | Create subscription |
| | GET | `/subscriptions/:userId` | Get subscriptions |
| | PUT | `/subscription/:id` | Update subscription |
| | DELETE | `/subscription/:id` | Delete subscription |
| **System** | GET | `/health` | Health check |

### 📖 Documentation Files

- **[Complete API Documentation](./API_DOCUMENTATION.md)** ← Detailed endpoint docs
- **[Postman Collection](./POSTMAN_COLLECTION.json)** ← Import for testing

### 🔐 Authentication

All protected endpoints require Bearer token:

```
Authorization: Bearer <jwt_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3002/api/auth/profile
```

### 📄 Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Details"
}
```

---

## 💾 Database Models

### 👤 User Schema

```javascript
{
  name: String,                    // Full name
  email: String,                   // Unique email
  password: String,                // Hashed (optional for Google)
  googleId: String,                // Google OAuth ID
  photo: String,                   // Profile photo URL
  emailNotifications: Boolean,      // Email alerts enabled
  reminderTime: String,            // Preferred time (HH:mm)
  avatar: String,                  // Avatar URL
  createdAt: Date                  // Account creation
}
```

### 📦 Item Schema

```javascript
{
  userId: String,                  // User reference
  itemName: String,                // Product name
  category: String,                // Category
  expiryDate: Date,                // Expiration date
  reminderDaysBefore: Number,      // Alert days before
  itemImage: String,               // Product image
  notes: String,                   // Additional notes
  barcode: String,                 // Product barcode
  expiryStatus: String,            // 'safe' | 'expiringSoon' | 'expired'
  createdAt: Date                  // Created date
}
```

### 🏷️ Product Schema

```javascript
{
  barcode: String,                 // Product barcode
  name: String,                    // Product name
  category: String,                // Category
  manufacturer: String,            // Manufacturer
  expiryShelfLife: Number,         // Days until expiry
  source: String,                  // 'api' | 'manual' | 'database'
  createdAt: Date
}
```

### 💳 Subscription Schema

```javascript
{
  userId: String,                  // User reference
  name: String,                    // Service name
  category: String,                // Type
  startDate: Date,                 // Start date
  renewalDate: Date,               // Next renewal
  cost: Number,                    // Monthly/yearly cost
  status: String,                  // 'active' | 'paused' | 'cancelled'
  createdAt: Date
}
```

---

## 🎯 Key Features Explained

### 1️⃣ Smart Expiry Tracking

Items are automatically categorized:

| Status | Condition | Action |
|--------|-----------|--------|
| 🟢 **Safe** | Days until expiry > reminder days | No action |
| 🟡 **Expiring Soon** | Days until expiry ≤ reminder days | Send reminder |
| 🔴 **Expired** | Past expiration date | Mark as expired |

### 2️⃣ Automated Email System

```
├─ Daily Scheduler (node-cron)
├─ Checks expiring items
├─ Sends email reminders
└─ Respects user preferences
```

**Email Trigger:** Runs daily at user's reminder time

### 3️⃣ Barcode Scanning

```
User scans barcode
        ↓
Camera captures code
        ↓
Look up in database
        ↓
Auto-fill product info
        ↓
Set expiry date & save
```

### 4️⃣ Multi-Authentication

- **Email/Password**: Traditional signup with JWT
- **Google OAuth**: Quick login with Google account
- **Password Security**: bcryptjs hashing with salt rounds

### 5️⃣ Profile Management

Users can customize:
- ✏️ Name & photo
- 🔔 Notification preferences
- ⏰ Reminder time
- 👤 Avatar/profile picture

---

## 🔧 Troubleshooting

### 🔴 Backend Issues

#### MongoDB Connection Error
```
❌ Error: connect ECONNREFUSED
✅ Solution:
   1. Start MongoDB: mongod
   2. Verify MONGODB_URI in .env
   3. For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/expirio
```

#### Email Not Sending
```
❌ Error: Cannot send email
✅ Solution:
   1. Enable 2FA in Gmail settings
   2. Generate App-Specific Password
   3. Update EMAIL_PASSWORD with app password
   4. Test: GET /api/auth/test-email
```

#### JWT Token Errors
```
❌ Error: Invalid token
✅ Solution:
   1. Clear JWT_SECRET in .env
   2. Generate new token via login
   3. Ensure token in Authorization header
```

### 🔴 Frontend Issues

#### Cannot Connect to Backend
```
❌ Error: Network request failed
✅ Solution:
   - Emulator: Use 10.0.2.2 instead of localhost
   - Device: Use machine IP (ipconfig)
   - Browser: Use localhost:3002
```

#### Barcode Scanner Not Working
```
❌ Error: Camera permission denied
✅ Solution:
   1. Grant camera permission when prompted
   2. Use good lighting
   3. Hold barcode steady 2-3 seconds
   4. Try different barcode angle
```

#### Build Errors
```
❌ Error: Module not found
✅ Solution:
   npm install
   expo start --clear
   Clear iOS build: rm -rf node_modules ios
```

---

## 🤝 Contributing

### Contribution Workflow

```
1. Fork Repository
   ↓
2. Create Feature Branch
   git checkout -b feature/amazing-feature
   ↓
3. Make Changes
   - Follow code style
   - Add comments
   - Test thoroughly
   ↓
4. Commit Changes
   git commit -m "Add amazing feature"
   ↓
5. Push to Branch
   git push origin feature/amazing-feature
   ↓
6. Create Pull Request
   - Describe changes
   - Reference issues
   - Request review
```

### Code Guidelines

- ✅ Use meaningful variable names
- ✅ Add comments for complex logic
- ✅ Follow project structure
- ✅ Test before pushing
- ✅ Update documentation

### Issues & Features

Found a bug? Have an idea?

1. Check existing issues
2. Create new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Backend Routes** | 17 endpoints |
| **Frontend Screens** | 12 screens |
| **Database Models** | 4 schemas |
| **API Controllers** | 4 controllers |
| **Middleware Layers** | JWT auth |
| **Storage Types** | MongoDB + AsyncStorage |
| **Images/Assets** | Android drawables included |

---

## 🔐 Security Features

✅ Password hashing with bcryptjs (10 salt rounds)
✅ JWT token-based authentication
✅ CORS protection enabled
✅ Environment variables for secrets
✅ MongoDB input validation
✅ Error message sanitization
✅ API rate limiting ready
✅ HTTPS support in production

---

## 📦 Deployment

### Frontend Deployment (Expo)

```bash
# Build APK for Android
cd frontend
eas build --platform android

# Build IPA for iOS (Mac only)
eas build --platform ios

# Deploy to Expo
eas submit --platform android/ios
```

### Backend Deployment

**Recommended Hosting:**
- Heroku
- Render
- Railway
- DigitalOcean
- AWS EC2

**MongoDB:**
- MongoDB Atlas (Cloud)
- Self-hosted server

---

## 📝 License

ISC License - Use freely in your projects

---

## 🙋 Support & FAQ

**Q: Can I use this commercially?**
A: Yes! ISC license allows commercial use.

**Q: How do I customize the app?**
A: Edit screens in `frontend/src/screens/` and components in `src/components/`

**Q: Can I add more categories?**
A: Yes! Update category options in Item model and UI screens.

**Q: How do I change app colors?**
A: Edit `frontend/src/utils/colors.js` and update components.

**Q: Can I use different database?**
A: Yes! Update models and connection in `backend/server.js`

---

## 📞 Contact & Resources

| Link | Purpose |
|------|---------|
| 📧 Email Support | issues@expirio.dev |
| 💬 Discord | [Join Community](#) |
| 🐛 Bug Reports | [GitHub Issues](#) |
| 📚 Documentation | [Full Wiki](#) |
| 🎥 Video Tutorials | [YouTube Channel](#) |

---

## 🎉 Acknowledgments

Thanks to:
- **Express.js** community
- **React Native** ecosystem
- **MongoDB** database
- **Expo** platform
- All **contributors** and **users**!

---

<div align="center">

### ⭐ If you find this helpful, please give it a star! ⭐

Made with ❤️ by Expirio Team

**[↑ Back to Top](#-expirio---smart-expiry-tracker)**

</div>
