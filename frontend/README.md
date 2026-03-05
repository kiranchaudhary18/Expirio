# Expirio - Smart Expiry Tracker

A React Native Expo mobile app for tracking expiry dates of items like food, medicines, cosmetics, and subscriptions.

## Features

- **Home Dashboard**: View all items with their expiry status (Expired, Expiring Soon, Safe)
- **Add Items**: Add new items with name, category, expiry date, and reminder settings
- **Barcode Scanner**: Scan barcodes to quickly add products
- **Subscription Tracking**: Track subscription renewals and monthly costs
- **Profile & Settings**: Manage preferences, dark mode, and notifications

## Tech Stack

- React Native
- Expo SDK 50
- React Navigation 6
- Axios for API calls
- Expo Camera & Barcode Scanner

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd expirio/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
frontend/
├── App.js                    # Main entry point
├── package.json              # Dependencies
├── app.json                  # Expo configuration
├── assets/                   # Images, icons, splash
└── src/
    ├── components/           # Reusable UI components
    │   ├── ItemCard.js
    │   ├── DashboardCard.js
    │   └── CustomButton.js
    ├── navigation/           # Navigation configuration
    │   └── BottomTabNavigator.js
    ├── screens/              # App screens
    │   ├── SplashScreen.js
    │   ├── HomeScreen.js
    │   ├── AddItemScreen.js
    │   ├── ScannerScreen.js
    │   ├── SubscriptionScreen.js
    │   ├── ProfileScreen.js
    │   └── ItemDetailScreen.js
    ├── services/             # API services
    │   └── api.js
    └── utils/                # Utilities
        └── colors.js
```

## Database Schema

### Item
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| userId | String | User reference |
| itemName | String | Name of the item |
| category | String | Food, Medicine, Cosmetics, Other |
| expiryDate | Date | Expiry date |
| reminderDaysBefore | Number | Days before expiry to remind |
| itemImage | String | Image URI |
| notes | String | Additional notes |
| expiryStatus | String | expired, expiringSoon, safe |
| createdAt | Date | Creation timestamp |

### Subscription
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| userId | String | User reference |
| subscriptionName | String | Name of subscription |
| renewalDate | Date | Next renewal date |
| amount | Number | Monthly cost |
| renewalReminderDays | Number | Days before renewal to remind |
| createdAt | Date | Creation timestamp |

## API Configuration

The app is configured to connect to a backend at:
```
http://localhost:3000/api
```

Update the `baseURL` in `src/services/api.js` to point to your backend server.

## Color Theme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #6C63FF | Buttons, highlights |
| Background | #F8F9FF | App background |
| Card | #FFFFFF | Card backgrounds |
| Text | #0F172A | Primary text |
| Expired | #EF4444 | Expired status |
| Expiring Soon | #F59E0B | Warning status |
| Safe | #10B981 | Safe status |

## License

MIT License - Feel free to use this project as a starting point for your own apps.
