# Admin Authentication System

## Overview

This authentication system provides secure admin access to the Feedback Collection System using industry-standard security practices.

## Technology Stack

- **Express.js**: Web framework for Node.js
- **bcryptjs**: Password hashing library
- **jsonwebtoken (JWT)**: JSON Web Token implementation for stateless authentication

## Components

### 1. Authentication Middleware (`middleware/auth.js`)

The authentication middleware protects admin routes by:

- Extracting JWT token from the Authorization header (`Bearer <token>`)
- Verifying the token's authenticity and validity
- Finding the corresponding admin user in the database
- Attaching the admin user object to the request for use in subsequent handlers
- Providing comprehensive error handling for various token issues

### 2. Authentication Controller (`controllers/authController.js`)

The controller handles all authentication-related business logic:

- **Login**: Validates credentials and generates JWT token
- **Register**: Creates new admin accounts with proper password hashing
- **Verify Token**: Confirms token validity and returns admin info
- **Logout**: Handles logout process (stateless, may include token blacklisting in extended implementations)

### 3. Authentication Routes (`routes/auth.js`)

Provides the following API endpoints:

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/verify` - Token verification (protected route)
- `POST /api/auth/logout` - Admin logout (protected route)

## Security Features

### Password Hashing
- Passwords are automatically hashed using bcrypt with 12 rounds
- Hashing occurs before saving to database via Mongoose middleware
- Plain text passwords are never stored

### JWT Implementation
- Tokens are signed with a secret key stored in environment variables
- Tokens have configurable expiration (default: 24 hours)
- Token verification includes proper error handling for expired/invalid tokens

### Input Validation
- Comprehensive validation on all input fields
- Proper error responses with descriptive messages
- Protection against common attacks

## API Endpoints

### POST /api/auth/login
Authenticates an admin user and returns a JWT token.

**Request Body:**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "username": "admin_username",
    "role": "admin_role",
    "createdAt": "timestamp"
  }
}
```

### POST /api/auth/register
Creates a new admin account.

**Request Body:**
```json
{
  "username": "new_admin_username",
  "password": "new_admin_password",
  "role": "admin_role"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully.",
  "token": "jwt_token_here",
  "admin": {
    "id": "new_admin_id",
    "username": "new_admin_username",
    "role": "admin_role",
    "createdAt": "timestamp"
  }
}
```

### GET /api/auth/verify
Verifies the validity of a JWT token (requires valid token in Authorization header).

**Success Response:**
```json
{
  "success": true,
  "message": "Token is valid.",
  "admin": {
    "id": "admin_id",
    "username": "admin_username",
    "role": "admin_role"
  }
}
```

## Error Handling

The system provides comprehensive error handling:

- **400 Bad Request**: Validation errors or missing required fields
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Invalid or expired token
- **409 Conflict**: Resource already exists (e.g., duplicate username)
- **500 Internal Server Error**: Server-side errors

## Environment Variables

The authentication system requires the following environment variables:

- `JWT_SECRET`: Secret key for signing JWT tokens (required)
- `JWT_EXPIRES_IN`: Token expiration time (optional, defaults to '24h')

## Usage in Protected Routes

To protect any route with authentication, simply add the `authenticateToken` middleware:

```javascript
const { authenticateToken } = require('../middleware/auth');

app.get('/protected-route', authenticateToken, (req, res) => {
  // Access the authenticated admin via req.admin
  res.json({ message: 'This is a protected route', admin: req.admin });
});
```

## Best Practices Implemented

- Separation of concerns (routes, controllers, middleware)
- Proper error handling and validation
- Secure password storage
- Stateless authentication with JWT
- Protection against common security vulnerabilities
- Comprehensive API documentation