# Google OAuth 2.0 Complete Setup Guide for Expirio

## Overview
Google Sign-In is now fully integrated into both **Login** and **Signup** screens. Users can click "Continue with Google" to authenticate directly without entering email/password.

---

## Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **Project Dropdown** at the top
3. Click **NEW PROJECT**
4. Enter project name: `Expirio`
5. Click **CREATE**

### Step 2: Enable Required APIs
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Google+ API** (for user profile info)
   - **OAuth 2.0** (for authentication)

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth Client ID**
3. Choose application type: **Android** or **iOS** (depending on your target platform)

#### For Android:
- Get your app's SHA1 fingerprint:
  ```bash
  cd frontend
  # For debug build:
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- Copy the SHA1 fingerprint (format: `AA:BB:CC:DD:EE:FF:...`)
- In the credential form, use package name: `com.expirio.app`
- Paste the SHA1 fingerprint

#### For iOS:
- Bundle ID: `com.expirio.app`
- App Store ID: (leave blank for development)
- Team ID: (leave blank for development)

### Step 4: Copy Your Client ID
1. After creating the credential, you'll see your **Client ID**
2. Format: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
3. Copy this value - you'll need it below

---

## Part 2: Configure Expirio App

### Step 5: Update LoginScreen.js
1. Open `frontend/src/screens/LoginScreen.js`
2. Find line with `const GOOGLE_CLIENT_ID = ...`
3. Replace the placeholder with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```

### Step 6: Update SignupScreen.js
1. Open `frontend/src/screens/SignupScreen.js`
2. Find line with `const GOOGLE_CLIENT_ID = ...` (in `handleGoogleSignup` function)
3. Replace with your actual Client ID (same as above)

### Step 7: Update Backend API Endpoint
In both LoginScreen.js and SignupScreen.js, update the backend API endpoint in the `handleGoogleLogin` and `handleGoogleSignup` functions:

**Find this line:**
```javascript
const response = await axios.post('http://192.168.x.x:3002/api/auth/google', {
```

**Replace with your actual backend IP/URL:**
```javascript
// For local testing:
const response = await axios.post('http://192.168.1.100:3002/api/auth/google', {

// For production:
const response = await axios.post('https://your-backend-domain.com/api/auth/google', {
```

---

## Part 3: Backend Configuration

Your backend already has Google OAuth endpoint configured at `POST /api/auth/google`:

### The endpoint expects:
```json
{
  "code": "authorization_code_from_google",
  "redirectUrl": "expirio://oauth/callback"
}
```

### The endpoint returns:
```json
{
  "token": "jwt_auth_token",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@gmail.com",
    "googleId": "google_oauth_id",
    "photo": "profile_photo_url"
  }
}
```

### Backend is ready to:
- ✅ Accept Google OAuth codes
- ✅ Exchange codes for Google tokens (using CLIENT_SECRET from .env)
- ✅ Fetch user profile from Google
- ✅ Auto-create user if new (signup flow)
- ✅ Auto-login if existing (login flow)
- ✅ Store googleId and photo in database
- ✅ Return JWT token for session management

---

## Part 4: Testing Google Sign-In

### Test on Android:
```bash
cd frontend
npx expo start
# Select 'a' or build APK
```

### Test on iOS:
```bash
cd frontend
npx expo start
# Select 'i' or build via EAS
```

### Expected Flow:
1. **User** taps "Continue with Google" button
2. **Google Sign-In dialog** opens in browser
3. **User** selects their Google account
4. **App** receives authorization code
5. **Backend** exchanges code for tokens & user data
6. **App** logs in user and navigates to home screen
7. **Success!** ✅

---

## Part 5: Environment Variables

Ensure your backend `.env` has these set:

```env
# Google OAuth Config (.env)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Get these from Google Cloud Console:
# - Go to Credentials → Your OAuth 2.0 Client
# - Download JSON → Copy CLIENT_ID and CLIENT_SECRET
```

---

## Part 6: Debugging

### Error: "Cannot use AuthSession proxy"
- **Cause:** Project name not configured
- **Solution:** Already fixed - using `useProxy: false`

### Error: "Redirect URL mismatch"
- **Cause:** Redirect URL in app doesn't match Google Console
- **Solution:** Make sure both are: `expirio://oauth/callback`

### Error: "Invalid Client ID"
- **Cause:** Wrong Client ID in code
- **Solution:** Copy exact Client ID from Google Cloud Console

### Error: "Code exchange failed"
- **Cause:** Backend CLIENT_SECRET is wrong/missing
- **Solution:** Verify `.env` has correct GOOGLE_CLIENT_SECRET

### Error: "Google+ API not enabled"
- **Cause:** API not enabled in Google Cloud Console
- **Solution:** Enable Google+ API and Google Drive API

---

## Part 7: Architecture Summary

```
User Taps "Continue with Google"
    ↓
expo-auth-session opens Google OAuth flow
    ↓
Google shows login dialog
    ↓
User selects account
    ↓
Google redirects to: expirio://oauth/callback?code=AUTH_CODE
    ↓
App receives authorization code
    ↓
App sends code + CLIENT_ID to backend
    ↓
Backend (authController.js) exchanges code for OAuth token
    ↓
Backend fetches user profile from Google
    ↓
Backend creates/updates user in MongoDB
    ↓
Backend returns JWT token
    ↓
App stores JWT + navigates to home
    ↓
User is authenticated ✅
```

---

## Part 8: Features Implemented

### ✅ Completed
- Google OAuth 2.0 flow (PKCE enabled)
- Login Screen: "Continue with Google" button
- Signup Screen: "Continue with Google" button
- Backend: googleLogin() endpoint
- Auto user creation on signup
- Auto user login on next signin
- User profile photo stored
- Secure JWT token generation
- Error handling & user feedback

### 📱 User Experience
```
Login Screen:
  [Expirio Logo]
  [Continue with Google] ← NEW
  ─────────── or ───────────
  [Email Input]
  [Password Input]
  [Remember Me]
  [Sign In]
  
Signup Screen:
  [Expirio Logo]
  [Continue with Google] ← NEW
  ─────────── or ───────────
  [Name Input]
  [Email Input]
  [Password Input]
  [Confirm Password]
  [I agree to Terms]
  [Create Account]
```

---

## Next Steps

1. **Get Google Client ID** from Google Cloud Console
2. **Update LoginScreen.js** with your Client ID
3. **Update SignupScreen.js** with your Client ID
4. **Update backend IP** in both screens
5. **Ensure backend .env** has GOOGLE_CLIENT_SECRET
6. **Test on device/emulator** - tap "Continue with Google"
7. **Verify user creation** in MongoDB
8. **Check JWT token** stored in AsyncStorage

---

## Support

If you encounter issues:
1. Check browser console (Google OAuth errors)
2. Check backend logs (authentication errors)
3. Verify Client ID matches in all locations
4. Verify redirect URL: `expirio://oauth/callback`
5. Verify APIs are enabled in Google Cloud Console
6. Verify .env has GOOGLE_CLIENT_SECRET set

Good luck! 🚀
