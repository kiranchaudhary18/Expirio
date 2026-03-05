# Expirio Backend - Installation & Setup Guide

## Quick Start

### 1. Prerequisites

Make sure you have the following installed:
- **Node.js** (v14.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher)
  - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

### 2. Installation Steps

#### Step 1: Navigate to Backend Directory
```bash
cd expirio/backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemon` - Development tool (auto-reload)

#### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory (if not already created):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expirio
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/expirio?retryWrites=true&w=majority
NODE_ENV=development
```

Replace `username:password` with your MongoDB Atlas credentials.

#### Step 4: Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas:**
No action needed - it's hosted in the cloud.

#### Step 5: Start the Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
Expirio Backend Server running on port 3000
Environment: development
MongoDB connected successfully
```

### 3. Verify Installation

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Expirio Backend API is running",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

## MongoDB Setup

### Option 1: Local MongoDB

#### Windows
1. Download MongoDB Community Edition
2. Run the installer
3. MongoDB will be installed as a service
4. Run `mongod` from PowerShell/Command Prompt

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get connection string
6. Update `.env` with the connection string

## Testing API Endpoints

### Using cURL (Command Line)

#### Create an Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "itemName": "Milk",
    "category": "Dairy",
    "expiryDate": "2024-12-31",
    "reminderDaysBefore": 2,
    "notes": "Keep refrigerated"
  }'
```

#### Get User Items
```bash
curl http://localhost:3000/api/items/user123
```

#### Create a Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "subscriptionName": "Netflix",
    "renewalDate": "2024-04-15",
    "amount": 199,
    "renewalReminderDays": 3
  }'
```

#### Get User Subscriptions
```bash
curl http://localhost:3000/api/subscriptions/user123
```

### Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection named "Expirio"
3. Add requests for each endpoint
4. Set the base URL to `http://localhost:3000`
5. Test all endpoints

## Troubleshooting

### Problem: MongoDB Connection Error
**Error**: `MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Make sure MongoDB is running (`mongod` command)
- Check if port 27017 is available
- For MongoDB Atlas, verify connection string in `.env`
- Check internet connectivity

### Problem: Port Already in Use
**Error**: `listen EADDRINUSE: address already in use :::3000`

**Solution**:
- Change the PORT in `.env` to an unused port (e.g., 3001)
- Or kill the process using port 3000:
  - Windows: `netstat -ano | findstr :3000`
  - macOS/Linux: `lsof -i :3000` then `kill -9 <PID>`

### Problem: nodemon not found
**Error**: `nodemon: command not found`

**Solution**:
```bash
npm install -g nodemon
# OR
npx nodemon server.js
```

### Problem: Module not found
**Error**: `Cannot find module 'express'`

**Solution**:
```bash
npm install
```

## Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json              # Dependencies & scripts
├── .env                      # Environment variables
├── .env.example              # Example env file
├── .gitignore                # Git ignore rules
├── README.md                 # API documentation
├── INSTALL.md                # This file
└── src/
    ├── controllers/
    │   ├── itemController.js
    │   └── subscriptionController.js
    ├── models/
    │   ├── Item.js
    │   └── Subscription.js
    ├── routes/
    │   ├── itemRoutes.js
    │   └── subscriptionRoutes.js
    ├── middleware/
    │   └── auth.js           # Auth middleware (placeholder)
    └── utils/
        └── helpers.js        # Utility functions
```

## Database Models

### Item Collection

```javascript
{
  _id: ObjectId,
  userId: String,              // Required
  itemName: String,            // Required
  category: String,            // Required
  expiryDate: Date,            // Required
  reminderDaysBefore: Number,  // Default: 1
  itemImage: String,           // Optional
  notes: String,               // Optional
  expiryStatus: String,        // 'expired' | 'expiringSoon' | 'safe'
  createdAt: Date              // Default: now
}
```

### Subscription Collection

```javascript
{
  _id: ObjectId,
  userId: String,              // Required
  subscriptionName: String,    // Required
  renewalDate: Date,           // Required
  amount: Number,              // Optional
  renewalReminderDays: Number, // Default: 1
  createdAt: Date              // Default: now
}
```

## Development Tips

### Using Environment Variables
All configuration is in `.env`. Never commit `.env` to git.

### Debugging
Enable detailed logging:
```javascript
// In server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Adding New Routes
1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Import in `server.js` with `app.use(require('./src/routes/...'))`

## Next Steps

1. **Test all endpoints** - Use Postman or cURL
2. **Connect frontend** - Update API base URL in React Native app
3. **Add authentication** - Implement JWT in middleware
4. **Add validation** - Use libraries like `joi` or `yup`
5. **Deploy** - Use Heroku, AWS, or DigitalOcean

## Useful Commands

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Install new package
npm install package-name

# Update all packages
npm update

# Check Node.js version
node -v

# Check npm version
npm -v

# Clear MongoDB database (use with caution!)
mongo expirio --eval "db.dropDatabase()"
```

## Support

For issues or questions:
1. Check the README.md for API documentation
2. Verify `.env` configuration
3. Check MongoDB connection
4. Review console logs for error messages
5. Check if all dependencies are installed

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Best Practices](https://restfulapi.net/)

Happy coding! 🚀
