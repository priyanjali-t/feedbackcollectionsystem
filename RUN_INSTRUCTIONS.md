# Feedback Collection System - Run Instructions

## 1. Running the Project Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager
- MongoDB Compass (for database visualization)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set up Environment Variables
Create a `.env` file in the root directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback_system
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_this_to_a_long_random_string_for_production
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
NODE_ENV=development
```

**Important**: Replace `your_very_secure_jwt_secret_key_here_change_this_to_a_long_random_string_for_production` with a strong, random secret key.

### Step 3: Start MongoDB
Make sure MongoDB is running locally:
- **Windows**: Start MongoDB service or run `mongod` in a separate terminal
- **macOS/Linux**: Start MongoDB service or run `mongod` in a separate terminal

### Step 4: Run the Application
```bash
# Development mode (with auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Step 5: Access the Application
- **User Feedback Form**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin
- **API Base URL**: http://localhost:5000/api

---

## 2. Connect MongoDB using MongoDB Compass

### Step 1: Install MongoDB Compass
- Download from: https://www.mongodb.com/products/compass
- Install and open MongoDB Compass

### Step 2: Connect to Local MongoDB
1. Open MongoDB Compass
2. In the connection string field, enter: `mongodb://localhost:27017`
3. Click "Connect"
4. You should see your local MongoDB instance connected

### Step 3: View Collections
1. Look for the database named `feedback_system` (or whatever you specified in MONGODB_URI)
2. You should see collections:
   - `feedbacks` - Contains user feedback entries
   - `admins` - Contains admin user accounts
3. You can browse, search, and modify documents directly in Compass

### Step 4: Verify Data
- After submitting feedback through the form, check the `feedbacks` collection
- After admin registration/login, check the `admins` collection (password will be hashed)

---

## 3. Test APIs using Browser/Postman

### API Endpoints

#### Feedback Endpoints
- `POST /api/feedback/submit` - Submit new feedback
- `GET /api/feedback` - Get all feedback (admin only)
- `GET /api/feedback/analytics` - Get feedback analytics (admin only)
- `GET /api/feedback/:id` - Get specific feedback (admin only)
- `PATCH /api/feedback/:id` - Update feedback status (admin only)
- `DELETE /api/feedback/:id` - Delete feedback (admin only)

#### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/verify` - Verify JWT token (admin only)
- `POST /api/auth/logout` - Admin logout (admin only)

### Testing with Postman

#### 1. Admin Registration
- **Method**: POST
- **URL**: http://localhost:5000/api/auth/register
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```
- **Expected Response**: 201 Created with JWT token

#### 2. Admin Login
- **Method**: POST
- **URL**: http://localhost:5000/api/auth/login
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Expected Response**: 200 OK with JWT token

#### 3. Submit Feedback (No Auth Required)
- **Method**: POST
- **URL**: http://localhost:5000/api/feedback/submit
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "category": "General",
  "rating": 5,
  "message": "Great service!"
}
```
- **Expected Response**: 201 Created

#### 4. Get All Feedback (Admin Only)
- **Method**: GET
- **URL**: http://localhost:5000/api/feedback
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token_here>`
- **Expected Response**: 200 OK with feedback list

#### 5. Update Feedback Status (Admin Only)
- **Method**: PATCH
- **URL**: http://localhost:5000/api/feedback/<feedback_id>
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token_here>`
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "status": "approved"
}
```
- **Expected Response**: 200 OK

#### 6. Get Analytics (Admin Only)
- **Method**: GET
- **URL**: http://localhost:5000/api/feedback/analytics
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token_here>`
- **Expected Response**: 200 OK with analytics data

### Testing with Browser
- Navigate to http://localhost:5000 for the feedback form
- Navigate to http://localhost:5000/admin for the admin dashboard
- Use the admin credentials to log in and manage feedback

---

## 4. Common Errors and Fixes

### MongoDB Connection Issues

**Error**: `MongoError: failed to connect to server`
**Fix**: 
1. Ensure MongoDB service is running
2. Check if MongoDB is listening on port 27017
3. Verify the MONGODB_URI in your .env file

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:27017`
**Fix**:
1. Start MongoDB service: `mongod`
2. Or use MongoDB Atlas connection string in MONGODB_URI

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`
**Fix**:
1. Change the PORT in .env file to another port (e.g., 5001)
2. Or kill the process using port 5000:
   - **Windows**: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - **macOS/Linux**: `lsof -i :5000` then `kill -9 <PID>`

### JWT Secret Issues

**Error**: `JsonWebTokenError: invalid signature`
**Fix**: Ensure JWT_SECRET in .env matches the one used to sign the token

**Error**: `TokenExpiredError: jwt expired`
**Fix**: The token has expired. Log in again to get a new token.

### CORS Issues

**Error**: `Access to fetch at 'http://localhost:5000/api/feedback/submit' from origin 'http://localhost:3000' has been blocked by CORS policy`
**Fix**: Check ALLOWED_ORIGINS in your .env file and ensure the frontend origin is included.

### Admin Authentication Issues

**Error**: `401 Unauthorized` when accessing admin endpoints
**Fix**: 
1. Ensure you're sending the JWT token in the Authorization header
2. Verify the token format: `Bearer <token>`
3. Check if the token hasn't expired
4. Verify admin credentials are correct

### Database Validation Errors

**Error**: `ValidationError: Name: Path 'name' is required`
**Fix**: Ensure all required fields are provided in the request body with correct format.

### Frontend Issues

**Error**: Feedback form doesn't submit
**Fix**: 
1. Check browser console for JavaScript errors
2. Verify the backend server is running
3. Check network tab for failed API requests

**Error**: Admin dashboard doesn't load
**Fix**:
1. Ensure you're logged in as admin
2. Check if JWT token is stored in localStorage
3. Verify the token is still valid

### Security-Related Issues

**Error**: `403 Forbidden` on API requests
**Fix**: This may indicate rate limiting. Wait 15 minutes or restart the server.

**Error**: `429 Too Many Requests`
**Fix**: Rate limit exceeded. Wait for the window to reset or adjust rate limiting settings.

### Installation Issues

**Error**: `npm install` fails with permission errors
**Fix**: 
1. Run as administrator (Windows) or with sudo (macOS/Linux)
2. Or use `npm install --unsafe-perm` if needed

**Error**: `node_modules` missing or corrupted
**Fix**: Delete node_modules and package-lock.json, then run `npm install` again

### Development Mode Issues

**Error**: `nodemon` not found
**Fix**: Install nodemon globally: `npm install -g nodemon`

**Error**: Auto-restart not working
**Fix**: Ensure nodemon is installed and run with `npm run dev`

### Production Deployment Issues

**Error**: Environment variables not loading in production
**Fix**: Ensure environment variables are properly set in your production environment

**Error**: Database connection failing in production
**Fix**: Use MongoDB Atlas or ensure production database URI is correct

---

## Troubleshooting Tips

1. **Check logs**: Always check the terminal output for error messages
2. **Browser DevTools**: Use F12 to check console and network tabs for frontend issues
3. **MongoDB Compass**: Use it to verify data is being stored correctly
4. **Postman/Insomnia**: Use these tools to test API endpoints independently
5. **Environment**: Ensure NODE_ENV is set correctly (development/production)
6. **File permissions**: Ensure the app has read/write permissions to necessary files
7. **Network**: Ensure no firewall is blocking the required ports

## Quick Start Checklist

- [ ] Node.js installed and running
- [ ] MongoDB installed and running
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm run dev`)
- [ ] MongoDB Compass connected
- [ ] Default admin account created
- [ ] APIs tested and working
- [ ] Frontend accessible and functional

If you encounter any issues not covered here, please check the detailed error messages in your terminal and browser console for more specific information.