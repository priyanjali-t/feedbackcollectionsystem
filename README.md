# Feedback Collection System

A complete feedback collection system with admin dashboard built using Node.js, Express, MongoDB, and modern web technologies.

## Features

- **User Feedback Form**: Collect feedback with name, email, category, rating, and message
- **Real-time Submission**: Instant feedback submission with validation
- **Secure Admin Authentication**: JWT-based authentication for admin access
- **Admin Dashboard**: View, filter, approve, and delete feedback
- **Analytics**: Total feedback, category counts, and average rating
- **Responsive UI**: Works on mobile and desktop devices
- **Data Security**: Password hashing, JWT tokens, and input validation
- **Feedback History Tracking**: Track feedback status and timestamps
- **Moderation Tools**: Approve, reject, or delete feedback items

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs for password hashing, helmet for security headers, express-rate-limit for rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone or download the project** to your local machine
2. **Navigate to the project directory** in your terminal
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up MongoDB**:
   - Make sure MongoDB is running locally on port 27017, OR
   - Update the `MONGODB_URI` in the `.env` file to point to your MongoDB instance
5. **Configure environment variables** (optional):
   - Rename `.env.example` to `.env` if it exists, OR
   - Update the `.env` file with your custom settings:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/feedback_system
     JWT_SECRET=your_secure_jwt_secret_here
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=admin123
     NODE_ENV=development
     ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will start on `http://localhost:5000` by default.

## Default Admin Credentials

After the first run, the system creates a default admin user:
- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the default password immediately after first login for security.

## Project Structure

```
FEEDBACK COLLECTION SYSTEM/
├── models/
│   ├── Feedback.js          # Feedback schema
│   └── Admin.js             # Admin user schema
├── controllers/             # Request handlers (not used in this implementation)
├── routes/
│   ├── feedback.js          # Feedback API routes
│   └── auth.js              # Authentication API routes
├── middleware/
│   └── auth.js              # Authentication middleware
├── config/
│   └── seedAdmin.js         # Admin user seeding
├── public/
│   ├── index.html           # User feedback form
│   ├── admin.html           # Admin dashboard
│   ├── css/
│   │   ├── style.css        # User form styles
│   │   └── admin.css        # Admin dashboard styles
│   └── js/
│       ├── main.js          # User form JavaScript
│       └── admin.js         # Admin dashboard JavaScript
├── .env                     # Environment variables
├── server.js                # Main server file
├── package.json             # Project dependencies
└── README.md               # This file
```

## API Endpoints

### Feedback Routes (`/api/feedback`)

- `POST /` - Submit new feedback
- `GET /` - Get feedback list (admin only)
- `GET /analytics` - Get feedback analytics (admin only)
- `PATCH /:id` - Update feedback status (admin only)
- `DELETE /:id` - Delete feedback (admin only)

### Auth Routes (`/api/auth`)

- `POST /login` - Admin login
- `GET /me` - Get current admin info (requires auth)

## Usage

### For Users
1. Visit `http://localhost:5000`
2. Fill out the feedback form with your name, email, category, rating, and message
3. Submit the form to send your feedback

### For Admins
1. Visit `http://localhost:5000/admin`
2. Log in with your admin credentials
3. View, filter, and manage feedback
4. Use moderation tools to approve, reject, or delete feedback
5. View analytics about feedback trends

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation and sanitization
- Rate limiting to prevent abuse
- Helmet middleware for security headers
- CORS configured for security

## Database Schema

### Feedback Schema
- `_id`: ObjectId
- `name`: String (required, max 100 chars)
- `email`: String (required, lowercase)
- `category`: String (enum: General, Technical, Sales, Support, Billing, Other)
- `rating`: Number (1-5)
- `message`: String (required, max 1000 chars)
- `status`: String (enum: pending, approved, rejected, default: pending)
- `createdAt`: Date
- `updatedAt`: Date

### Admin Schema
- `_id`: ObjectId
- `username`: String (required, unique, lowercase)
- `password`: String (required, min 6 chars)
- `createdAt`: Date

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running locally
   - Check the `MONGODB_URI` in your `.env` file

2. **Port Already in Use**:
   - Change the `PORT` in your `.env` file
   - Or stop the process using that port

3. **Admin Login Fails**:
   - Verify your username and password
   - Check that the admin user was created in the database

### Environment Variables

Make sure all required environment variables are set in your `.env` file:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong, random string)
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password (will be hashed automatically)

## License

This project is licensed under the MIT License.