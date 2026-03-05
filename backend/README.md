# Expirio Backend API

A complete Node.js, Express, and MongoDB backend for the Expirio - Smart Expiry Tracker mobile app.

## Features

- **Item Management**: Create, read, update, and delete expiry items
- **Subscription Management**: Track subscription renewals
- **Automatic Expiry Status**: Automatically calculates item expiry status (expired, expiringSoon, safe)
- **User Isolation**: All data is organized by userId
- **RESTful API**: Clean and intuitive API endpoints

## Technologies

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **CORS**: Cross-Origin Resource Sharing
- **Dotenv**: Environment variable management

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/expirio
   NODE_ENV=development
   ```

## Running the Server

### Development (with hot reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will be available at `http://localhost:3000`

## API Documentation

### Item Endpoints

#### Create Item
- **POST** `/api/items`
- **Body**:
  ```json
  {
    "userId": "user123",
    "itemName": "Milk",
    "category": "Dairy",
    "expiryDate": "2024-03-15",
    "reminderDaysBefore": 1,
    "itemImage": "url_to_image",
    "notes": "Keep in fridge"
  }
  ```

#### Get User Items
- **GET** `/api/items/:userId`
- **Response**: Array of items sorted by expiry date

#### Get Single Item
- **GET** `/api/item/:id`
- **Response**: Single item object

#### Update Item
- **PUT** `/api/item/:id`
- **Body**: Any fields to update

#### Delete Item
- **DELETE** `/api/item/:id`

### Subscription Endpoints

#### Create Subscription
- **POST** `/api/subscriptions`
- **Body**:
  ```json
  {
    "userId": "user123",
    "subscriptionName": "Netflix",
    "renewalDate": "2024-03-20",
    "amount": 99,
    "renewalReminderDays": 3
  }
  ```

#### Get User Subscriptions
- **GET** `/api/subscriptions/:userId`
- **Response**: Array of subscriptions sorted by renewal date

#### Update Subscription
- **PUT** `/api/subscription/:id`
- **Body**: Any fields to update

#### Delete Subscription
- **DELETE** `/api/subscription/:id`

### Other Endpoints

#### Health Check
- **GET** `/api/health`
- **Response**: Server status

## Database Schema

### Item Model

```javascript
{
  userId: String (required),
  itemName: String (required),
  category: String (required),
  expiryDate: Date (required),
  reminderDaysBefore: Number (default: 1),
  itemImage: String,
  notes: String,
  expiryStatus: String (enum: 'expired', 'expiringSoon', 'safe'),
  createdAt: Date (default: now)
}
```

### Subscription Model

```javascript
{
  userId: String (required),
  subscriptionName: String (required),
  renewalDate: Date (required),
  amount: Number,
  renewalReminderDays: Number (default: 1),
  createdAt: Date (default: now)
}
```

## Expiry Status Logic

The `expiryStatus` field is automatically calculated:

- **expired**: `expiryDate < today`
- **expiringSoon**: `expiryDate <= today + reminderDaysBefore`
- **safe**: otherwise

## Folder Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
└── src/
    ├── controllers/       # Business logic
    │   ├── itemController.js
    │   └── subscriptionController.js
    ├── models/           # MongoDB schemas
    │   ├── Item.js
    │   └── Subscription.js
    ├── routes/           # API routes
    │   ├── itemRoutes.js
    │   └── subscriptionRoutes.js
    ├── middleware/       # Custom middleware (for future use)
    └── utils/           # Utility functions (for future use)
```

## Response Format

All API responses follow this format:

**Success (2xx)**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* data */ }
}
```

**Error (4xx/5xx)**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Error Handling

- **400**: Bad Request (missing or invalid parameters)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

## MongoDB Connection

The backend connects to MongoDB using Mongoose. Update the `MONGODB_URI` in `.env`:

- **Local MongoDB**: `mongodb://localhost:27017/expirio`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/expirio`

## CORS Configuration

CORS is enabled for all origins. You can customize it in `server.js` if needed:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Contributing

Feel free to contribute and improve this backend!

## License

ISC
