# Testing Admin Login - Step-by-Step Guide

## Prerequisites
- Node.js installed
- MongoDB running locally
- Project dependencies installed

## Step 1: Verify Project Setup
1. Navigate to the project directory:
   ```bash
   cd "c:\Users\talar\FEEDBACK COLLECTION SYSTEM"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback_system
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_this_to_a_long_random_string_for_production
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

## Step 3: Verify MongoDB is Running
1. Open a new terminal/command prompt
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Keep this terminal running

## Step 4: Start the Application
In the project directory:
```bash
npm run dev
```

Expected output:
```
Connected to MongoDB
Checking for existing admin user...
Creating default admin user...
Default admin user created successfully!
Username: admin
Password: admin123 (default)
Server running on port 5000
```

## Step 5: Verify Admin User Creation
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Look for the `feedback_system` database
4. Open the `admins` collection
5. You should see one document with:
   - `username`: "admin"
   - `password`: (hashed value, not "admin123" in plain text)
   - `role`: "admin"

## Step 6: Test Login via Browser
1. Open browser to: http://localhost:5000/admin
2. The login modal should appear
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click "Login"
5. You should see a success toast: "Login successful!"
6. The dashboard should load with admin data

## Step 7: Test Login via Postman/cURL
### Login Request:
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

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "6585f3b8c9e8f3456789abcd",
    "username": "admin",
    "role": "admin",
    "createdAt": "2023-12-23T10:30:00.000Z"
  }
}
```

## Step 8: Verify Token Storage
1. Open browser developer tools (F12)
2. Go to Application tab
3. Check Local Storage for `admin_token`
4. The token should be stored after successful login

## Step 9: Test Protected Endpoints
After successful login, test other endpoints with the JWT token:
- **Method**: GET
- **URL**: http://localhost:5000/api/feedback
- **Headers**:
  - `Authorization: Bearer <your_jwt_token_here>`
  - `Content-Type: application/json`

## Troubleshooting Common Issues

### Issue 1: "Invalid credentials" error
**Possible causes:**
1. Admin user wasn't created properly
2. Password wasn't hashed correctly
3. Case sensitivity in username

**Solutions:**
1. Check MongoDB Compass to verify admin user exists
2. Ensure you're using lowercase "admin" as username
3. Verify password is exactly "admin123"

### Issue 2: 404 error on login
**Possible cause:** Route not registered correctly
**Solution:** Check server.js has proper route registration:
```javascript
app.use('/api/auth', authRoutes);
```

### Issue 3: 500 error on login
**Possible cause:** JWT_SECRET not set in environment
**Solution:** Ensure JWT_SECRET is set in your .env file

### Issue 4: MongoDB connection error
**Solution:** 
1. Ensure MongoDB service is running
2. Check MONGODB_URI in .env file
3. Verify MongoDB is accessible on port 27017

## Verification Checklist
- [ ] Server starts without errors
- [ ] Admin user created in MongoDB
- [ ] Login form accepts credentials
- [ ] Successful login returns JWT token
- [ ] Dashboard loads after login
- [ ] Token stored in localStorage
- [ ] Protected endpoints work with token

## Default Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: admin

The admin login should now work successfully with proper authentication and secure password handling.