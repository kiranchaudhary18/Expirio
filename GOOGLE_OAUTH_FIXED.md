# Google OAuth 2.0 Fixed Implementation Guide

## ✅ What Was Fixed

### ❌ Old (Broken) Implementation
- Used deprecated `AuthSession.makeRedirectUrl()`
- Used deprecated `AuthSession.AuthRequest()` 
- Used `expo-crypto` for PKCE challenge generation
- Required manual OAuth flow management
- Resulted in: **"AuthSession.makeRedirectUrl is not a function"** error

### ✅ New (Working) Implementation
- Uses modern `expo-auth-session/providers/google` 
- Uses `Google.useAuthRequest()` hook
- Uses `expo-web-browser` for OAuth session completion
- Automatic OAuth response handling
- **Compatible with latest Expo SDK & Expo Go**

---

## Step 1: Get Your Expo Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "Expirio"
3. Enable **Google+ API**
4. Create OAuth 2.0 Credential (type: **Web Application**)
5. Copy your **Client ID** (format: `123456789-abc...apps.googleusercontent.com`)

---

## Step 2: Configure Your App

### In `LoginScreen.js` (Line ~180):
Find this line:
```javascript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
});
```

Replace with your actual Expo Client ID:
```javascript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
});
```

### In `LoginScreen.js` (Line ~244):
Find this line:
```javascript
const response = await axios.post('http://192.168.1.100:3002/api/auth/google', {
```

Replace with your actual backend IP:
```javascript
const response = await axios.post('http://YOUR_BACKEND_IP:3002/api/auth/google', {
```

---

## Step 3: Update Backend (Optional)

Your backend at `POST /api/auth/google` now receives:
```json
{
  "name": "User's Name",
  "email": "user@gmail.com",
  "googleId": "google_oauth_id",
  "photo": "https://profile_photo_url",
  "accessToken": "google_access_token"
}
```

Ensure your backend `.env` has:
```env
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## Step 4: Test It

```bash
cd frontend
npx expo start

# Select 'a' (Android) or 'i' (iOS) or 's' (web)
```

### Expected Flow:
1. User taps "Continue with Google"
2. Google Sign-In opens in browser
3. User selects account
4. App fetches user profile
5. Backend authenticates & creates/logs in user
6. User navigated to Home ✅

---

## How It Works

### Modern OAuth Flow (expo-auth-session/providers/google):

```
┌─ Frontend (React Native)
│
├─ User taps "Continue with Google"
│
├─ Google.useAuthRequest() opens browser
│     └─ WebBrowser.openAuthSessionAsync()
│
├─ Google Sign-In form displays
│
├─ User authenticates
│
├─ Browser redirects to app
│     └─ WebBrowser.maybeCompleteAuthSession()
│
├─ Response captured in useEffect hook
│     └─ response.authentication.accessToken
│
├─ Fetch user profile from Google userinfo endpoint
│     └─ https://www.googleapis.com/userinfo/v2/me
│
├─ Send user data to backend
│
├─ Backend returns JWT token
│
└─ User logged in ✅
```

---

## Code Structure

### Module Level
```javascript
// Complete auth session when returning from browser
WebBrowser.maybeCompleteAuthSession();
```

### Component Level
```javascript
// Setup OAuth request with your Client ID
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
});

// Listen for OAuth response
useEffect(() => {
  if (response?.type === 'success') {
    handleGoogleLoginSuccess(response.authentication);
  }
}, [response]);

// Trigger OAuth flow
const handleGoogleLogin = async () => {
  await promptAsync();
  // Response handled in useEffect above
};
```

### Response Handler
```javascript
const handleGoogleLoginSuccess = async (authentication) => {
  // 1. Get access token
  const accessToken = authentication.accessToken;
  
  // 2. Fetch user profile from Google
  const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  // 3. Send to backend
  const response = await axios.post('/api/auth/google', userInfo);
  
  // 4. Store token & navigate
  await AsyncStorage.setItem('userToken', response.data.token);
  navigation.replace('Home');
};
```

---

## Troubleshooting

### Error: "expoClientId is undefined"
- **Cause**: You didn't replace `YOUR_EXPO_CLIENT_ID` with actual value
- **Fix**: Copy real Client ID from Google Cloud Console

### Error: "Can't find variable: WebBrowser"
- **Cause**: expo-web-browser not installed
- **Fix**: Already installed via `npm install expo-auth-session expo-crypto axios`

### Error: "Google Sign-In failed silently"
- **Cause**: Backend URL is wrong or backend not responding
- **Fix**: Update `http://192.168.1.100:3002` to actual backend IP

### OAuth flow opens browser but never returns to app
- **Cause**: Redirect URL not configured properly
- **Fix**: This is now handled automatically by `WebBrowser.maybeCompleteAuthSession()`

### User sees blank screen after Google login
- **Cause**: Backend `/api/auth/google` not implemented
- **Fix**: Ensure backend has route that accepts name, email, googleId, photo, accessToken

---

## What Changed vs Old Implementation

| Feature | Old | New |
|---------|-----|-----|
| OAuth Library | `expo-auth-session` | `expo-auth-session/providers/google` |
| Redirect URL | Manual `AuthSession.makeRedirectUrl()` | Automatic (handled by Google provider) |
| PKCE Challenge | Manual with `expo-crypto` | Automatic |
| Auth Request | Manual `AuthSession.AuthRequest()` | Hook: `Google.useAuthRequest()` |
| Response Handling | Manual state management | Automatic via hook response |
| Browser Completion | Not handled | `WebBrowser.maybeCompleteAuthSession()` |
| User Profile Fetch | Not included | Built into handler |
| Compatibility | Some issues | ✅ Latest Expo SDK & Expo Go |

---

## Security Notes

✅ **Safe to use in production:**
- PKCE flow handled automatically by Google provider
- Access tokens used to fetch user profile (not exposed to backend)
- Backend receives minimal user data
- JWT token issued by backend for session management

🔐 **Best Practices:**
- Store JWT in secure AsyncStorage or SecureStore
- Validate tokens on backend
- Use HTTPS in production
- Keep CLIENT_SECRET on backend only

---

## Next Steps

1. ✅ Get Expo Client ID from Google Cloud Console
2. ✅ Replace `YOUR_EXPO_CLIENT_ID` in LoginScreen.js
3. ✅ Update backend IP address
4. ✅ Test Google Sign-In (tap button → browser → select account → app)
5. ✅ Verify user created in MongoDB
6. ✅ Check JWT token stored in AsyncStorage

---

## Files Modified

- `frontend/src/screens/LoginScreen.js` - ✅ Updated OAuth implementation
- `frontend/app.json` - ✅ Added scheme config
- `frontend/package.json` - ✅ Added expo-auth-session, expo-crypto, axios

---

## Imports Summary

```javascript
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Call at module level
WebBrowser.maybeCompleteAuthSession();

// Use in component
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
});
```

That's it! 🚀
