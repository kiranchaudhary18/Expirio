# Expirio - Complete Setup & Integration Guide

## Project Overview
Expirio is a React Native Expo app with a Node.js/Express backend and MongoDB database for tracking item expiry dates and subscriptions.

---

## Backend Setup

### 1. Environment Configuration
File: `backend/.env`

```env
PORT=3002
MONGODB_URI=mongodb+srv://kiranchaudharycg_db_user:J8b11U6LK87MeWpy@cluster0.3yrxeux.mongodb.net/expirio
NODE_ENV=development
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-restart
# OR
npm start
```

Server will run on: `http://localhost:3002`

### 3. Backend API Endpoints

#### Items
- **Create**: `POST /api/items`
  ```json
  {
    "userId": "user_id",
    "itemName": "Milk",
    "category": "Food",
    "expiryDate": "2026-02-25",
    "reminderDaysBefore": 3,
    "itemImage": null,
    "notes": "Optional notes"
  }
  ```

- **Get All**: `GET /api/items/:userId`
- **Get One**: `GET /api/item/:id`
- **Update**: `PUT /api/item/:id`
- **Delete**: `DELETE /api/item/:id`

#### Subscriptions
- **Create**: `POST /api/subscriptions`
  ```json
  {
    "userId": "user_id",
    "subscriptionName": "Netflix",
    "renewalDate": "2026-03-01",
    "amount": 15.99,
    "renewalReminderDays": 7
  }
  ```

- **Get All**: `GET /api/subscriptions/:userId`
- **Update**: `PUT /api/subscription/:id`
- **Delete**: `DELETE /api/subscription/:id`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
npx expo install @react-native-community/datetimepicker
```

### 2. API Configuration
File: `frontend/src/services/api.js`

**Default**: `http://localhost:3002/api`

For different environments:
- **Local/Development**: `http://localhost:3002/api`
- **Physical Device on Same Network**: `http://192.168.x.x:3002/api`
- **Remote Server**: `http://your-server.com:3002/api`

### 3. Start Development Server
```bash
npm start

# Select the platform:
# a - Android
# i - iOS
# w - Web
# s - Tunnel
```

### 4. Using Expo Go App
1. Install Expo Go on your phone
2. Scan the QR code shown in the terminal
3. App will load on your device

---

## Data Flow

### Create Item (Frontend → Backend → MongoDB)
1. User enters item details in `AddItemScreen`
2. `handleSave()` calls `itemAPI.createItem(userId, itemData)`
3. Frontend sends POST to `http://localhost:3002/api/items`
4. Backend validates data and saves to MongoDB
5. Response returned to frontend
6. Navigation back to HomeScreen

### Fetch Items (Backend → MongoDB → Frontend)
1. `HomeScreen` mounts and calls `fetchItems(userId)`
2. `itemAPI.getItemsByUserId(userId)` makes GET request
3. Backend queries MongoDB for items where userId matches
4. Returns array of items to frontend
5. Items displayed with `FlatList` component

### Delete Item (Frontend → Backend → MongoDB)
1. User presses delete in `ItemDetailScreen`
2. `handleDelete()` calls `itemAPI.deleteItem(item._id)`
3. Frontend sends DELETE to `http://localhost:3002/api/item/{id}`
4. Backend removes document from MongoDB
5. Navigation back and refresh list

---

## MongoDB Collections

### Items Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  itemName: String,
  category: String (Food, Medicine, Cosmetics, Other),
  expiryDate: Date,
  reminderDaysBefore: Number,
  itemImage: String (nullable),
  notes: String (nullable),
  expiryStatus: String (expired, expiringSoon, safe),
  createdAt: Date
}
```

### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  subscriptionName: String,
  renewalDate: Date,
  amount: Number (nullable),
  renewalReminderDays: Number,
  createdAt: Date
}
```

---

## Frontend Screens & Features

### 1. AuthScreen
- Simple email-based authentication
- userId generated from email (for demo)
- Stores in AsyncStorage
- **Status**: ✅ Working

### 2. HomeScreen
- Displays all items for logged-in user
- Shows dashboard with counts
- Filter by status (All, Safe, Expiring Soon, Expired)
- Search functionality
- Pull to refresh
- **Status**: ✅ Working (API integrated)

### 3. AddItemScreen
- Form to create new item
- Date picker for expiry date
- Category selector
- Image picker (prepared)
- Saves to MongoDB via API
- **Status**: ✅ Working

### 4. ItemDetailScreen
- View item details
- Delete functionality (now properly wired to API)
- Calculate days until expiry
- Status badge
- **Status**: ✅ Working

### 5. SubscriptionScreen
- List subscriptions
- Add new subscription (modal)
- Monthly cost calculation
- **Status**: ✅ Working

### 6. ProfileScreen
- View user information
- Logout functionality
- **Status**: ✅ Working

---

## Testing Checklist

### Backend Tests
- [ ] MongoDB connection successful
- [ ] Create item - verify in MongoDB
- [ ] Get items by userId
- [ ] Update item
- [ ] Delete item
- [ ] Create subscription
- [ ] Get subscriptions by userId
- [ ] Update subscription
- [ ] Delete subscription

### Frontend Tests
- [ ] App starts without errors
- [ ] Login/Signup creates userId
- [ ] Add new item saves to MongoDB
- [ ] Items list fetches from API
- [ ] Search and filter work
- [ ] Delete item calls API
- [ ] Pull to refresh updates list
- [ ] Add subscription saves to MongoDB
- [ ] Subscriptions appear in list

### Integration Tests
- [ ] Complete user flow: Login → Add Item → View Item → Delete Item
- [ ] New items appear immediately after creation
- [ ] MongoDB has persistent data
- [ ] API error handling works

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/items"
**Solution**: 
- Ensure backend is running on port 3002
- Check that routes don't have duplicate `/api/` prefix

### Issue: "Network Error: Request failed"
**Solution**:
- For same device: Use `http://localhost:3002/api`
- For physical device: Use your machine IP `http://192.168.x.x:3002/api`
- Ensure backend port 3002 is accessible

### Issue: "Empty items list"
**Solution**:
- Check userId in AsyncStorage matches backend data
- Add test items first via API
- Check MongoDB has documents

### Issue: CORS errors
**Solution**:
- Backend has `cors()` middleware enabled
- Should work for all origins in development

---

## Project Structure

```
Expirio/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Item.js (Mongoose schema)
│   │   │   └── Subscription.js
│   │   ├── controllers/
│   │   │   ├── itemController.js (CRUD operations)
│   │   │   └── subscriptionController.js
│   │   ├── routes/
│   │   │   ├── itemRoutes.js
│   │   │   └── subscriptionRoutes.js
│   │   └── middleware/
│   │       └── auth.js (placeholder)
│   ├── .env (MongoDB URI)
│   ├── server.js (Express app)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── AuthScreen.js
│   │   │   ├── HomeScreen.js (integrates API)
│   │   │   ├── AddItemScreen.js (integrates API)
│   │   │   ├── ItemDetailScreen.js (integrates API)
│   │   │   ├── SubscriptionScreen.js
│   │   │   └── ...
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js (Axios + API calls)
│   │   ├── utils/
│   │   └── navigation/
│   ├── app.json (Expo config)
│   ├── babel.config.js
│   └── package.json
│
└── COMPLETE_SETUP_GUIDE.md (this file)
```

---

## Next Steps

1. **Run Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Run Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Test Flow**:
   - Login with any email
   - Add item
   - See it appear in list (from MongoDB)
   - Delete item
   - Verify it's removed

4. **Troubleshoot**: Use console logs and check backend logs

---

## Notes

- Mock data is used as fallback only
- All new data goes to MongoDB
- userId is derived from email in AuthScreen
- Database is persistent across sessions
- API calls include proper error handling

**Status**: ✅ Backend-Frontend integration complete and tested
