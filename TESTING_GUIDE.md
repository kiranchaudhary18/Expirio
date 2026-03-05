# Expirio Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd d:\Expirio\backend
npm start
```
Expected: Server running on port 3002 with MongoDB connected

### 2. Start Frontend
In another terminal:
```bash
cd d:\Expirio\frontend
npm start
```
Select 'w' for web, 'a' for Android, or 'i' for iOS

---

## Testing Flows

### Flow 1: Create Item & Verify in MongoDB

**Steps:**
1. Login with any email (e.g., test@example.com)
2. Tap "+" button to add new item
3. Fill in:
   - Item Name: "Milk"
   - Category: "Food"
   - Expiry Date: Select future date
   - Reminder: 3 days before
4. Tap "Add Item"
5. See success message

**Backend Verification:**
```bash
# In MongoDB Atlas or MongoDB Compass
# Collection: Expirio.Items
# Should have new document with above data
```

**Frontend Verification:**
- Item appears in HomeScreen list
- Status shows correct color (safe, expiring soon, expired)

---

### Flow 2: Search & Filter Items

**Steps:**
1. In HomeScreen, type in search box: "Milk"
2. Only milk item should appear
3. Tap filter buttons: Safe / Expiring Soon / Expired
4. List updates accordingly

**Expected:**
- Search filters by itemName and category
- Status filter works correctly

---

### Flow 3: Delete Item

**Steps:**
1. Tap on item in list to view details
2. Tap red delete button
3. Confirm deletion
4. Should return to HomeScreen

**Verification:**
- Item removed from list
- Item removed from MongoDB

```javascript
// Check MongoDB - item should be gone
```

---

### Flow 4: Add Subscription

**Steps:**
1. Go to Subscriptions tab
2. Tap "+" to add subscription
3. Fill in:
   - Name: "Netflix"
   - Amount: "15.99"
   - Renewal Date: March 1, 2026
   - Reminder: 7 days before
4. Tap "Save"

**Expected:**
- Success message
- Subscription appears in list
- Total monthly cost updates
- Data saved to MongoDB

---

### Flow 5: Refresh Data

**Steps:**
1. In HomeScreen, pull down to refresh
2. Should re-fetch items from API
3. Pull to refresh in SubscriptionScreen
4. Should re-fetch subscriptions

**Expected:**
- No error messages
- Data stays consistent

---

## Database Testing

### Check MongoDB Collections

```javascript
// Items Collection
db.items.find()
// Should return all items with userId

// Subscriptions Collection  
db.subscriptions.find()
// Should return all subscriptions with userId
```

### Sample Data Format

**Item:**
```json
{
  "_id": ObjectId("..."),
  "userId": "testatexamplecom",
  "itemName": "Milk",
  "category": "Food",
  "expiryDate": ISODate("2026-02-25"),
  "reminderDaysBefore": 3,
  "itemImage": null,
  "notes": "",
  "expiryStatus": "safe",
  "createdAt": ISODate("2026-02-25T10:30:00Z")
}
```

**Subscription:**
```json
{
  "_id": ObjectId("..."),
  "userId": "testatexamplecom",
  "subscriptionName": "Netflix",
  "renewalDate": ISODate("2026-03-01"),
  "amount": 15.99,
  "renewalReminderDays": 7,
  "createdAt": ISODate("2026-02-25T10:35:00Z")
}
```

---

## Error Testing

### Test 1: No User ID
**Steps:**
1. Clear AsyncStorage (logout)
2. Try to add item without logging in
3. Should show error: "User not logged in"

### Test 2: Network Error
**Steps:**
1. Stop backend server
2. Try to refresh items
3. Should fall back to mock data
4. Check console for error messages

### Test 3: Invalid Data
**Steps:**
1. Try to add item without name
2. Should show validation error
3. Form should not submit

---

## Performance Testing

### Check Response Times
Add console logs to frontend:

```javascript
// In api.js response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Request time:', response.request.responseTime);
    return response;
  }
);
```

Expected: < 500ms for most requests

---

## API Endpoint Testing (Postman)

### Create Item
```
POST http://localhost:3002/api/items
Content-Type: application/json

{
  "userId": "test@example",
  "itemName": "Test Item",
  "category": "Food",
  "expiryDate": "2026-02-25",
  "reminderDaysBefore": 3
}
```

### Get Items
```
GET http://localhost:3002/api/items/test@example
```

### Get Single Item
```
GET http://localhost:3002/api/item/{id}
```

### Update Item
```
PUT http://localhost:3002/api/item/{id}
Content-Type: application/json

{
  "itemName": "Updated Name"
}
```

### Delete Item
```
DELETE http://localhost:3002/api/item/{id}
```

### Create Subscription
```
POST http://localhost:3002/api/subscriptions
Content-Type: application/json

{
  "userId": "test@example",
  "subscriptionName": "Netflix",
  "renewalDate": "2026-03-01",
  "amount": 15.99,
  "renewalReminderDays": 7
}
```

### Get Subscriptions
```
GET http://localhost:3002/api/subscriptions/test@example
```

### Update Subscription
```
PUT http://localhost:3002/api/subscription/{id}
Content-Type: application/json

{
  "amount": 19.99
}
```

### Delete Subscription
```
DELETE http://localhost:3002/api/subscription/{id}
```

---

## Checklist

Backend:
- [ ] Server starts on port 3002
- [ ] MongoDB connection successful
- [ ] CORS enabled
- [ ] All endpoints respond with correct structure

Frontend:
- [ ] App starts without errors
- [ ] Login works
- [ ] Can add items
- [ ] Items appear in list
- [ ] Can delete items
- [ ] Can add subscriptions
- [ ] Search/filter work
- [ ] Pull to refresh works

Integration:
- [ ] New items appear immediately
- [ ] Deletions are reflected
- [ ] Data persists in MongoDB
- [ ] Correct userId handling
- [ ] Error handling works

---

## Troubleshooting Commands

### Check Backend Logs
```bash
npm start  # Shows all logs
```

### Check Frontend Logs
```bash
# In Expo terminal:
Press 'j' to access debugger
Check browser console (for web)
```

### Reset Frontend State
```bash
# Delete AsyncStorage data
# Login again
```

### Check Active Connections
```bash
# On Windows
netstat -ano | findstr :3002

# On Mac/Linux
lsof -i :3002
```

### Clear MongoDB (be careful!)
```javascript
// Delete all items for a user
db.items.deleteMany({userId: "testatexamplecom"})

// Delete all subscriptions for a user
db.subscriptions.deleteMany({userId: "testatexamplecom"})
```

---

## Success Criteria

✅ **Project is successful when:**
1. Backend starts and connects to MongoDB
2. Frontend can add items that save to MongoDB
3. Items list updates from Backend API
4. Can delete items - removes from both frontend and MongoDB
5. Subscriptions work the same way
6. Multiple users have separate data (by userId)
7. App works offline with mock data fallback
8. No syntax errors in console

---

## Notes

- `userId` is generated from email: `email.replace(/[^a-z0-9]/gi, '_').toLowerCase()`
- Example: `test@example.com` → `test_example_com`
- All dates are in ISO format: `YYYY-MM-DD`
- Mock data is fallback only - new data goes to MongoDB
- Timestamps are automatically added by MongoDB

