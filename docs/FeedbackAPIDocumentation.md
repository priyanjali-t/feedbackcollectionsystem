# Feedback API Documentation

## Overview

The Feedback API provides endpoints for submitting, retrieving, updating, and deleting feedback entries in the Feedback Collection System.

## Technology Stack

- **Express.js**: Web framework for Node.js
- **MongoDB**: Database for storing feedback entries
- **express-validator**: Request validation middleware
- **Mongoose**: MongoDB object modeling for Node.js

## API Endpoints

### POST /api/feedback/submit
Submits a new feedback entry.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "category": "General",
  "rating": 5,
  "message": "This is a great service! Very helpful and responsive."
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters, letters, spaces, hyphens, and apostrophes only
- `email`: Required, valid email format, max 100 characters
- `category`: Required, must be one of: General, Technical, Sales, Support, Billing, Other
- `rating`: Required, integer between 1 and 5
- `message`: Required, 10-1000 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully.",
  "feedback": {
    "id": "feedback_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "category": "General",
    "rating": 5,
    "message": "This is a great service! Very helpful and responsive.",
    "status": "pending",
    "createdAt": "2023-12-23T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
- `409 Conflict`: Duplicate entry
- `500 Internal Server Error`: Server error

### GET /api/feedback (Admin Only)
Retrieves all feedback entries with optional filtering and pagination.

**Authentication Required**: JWT token in Authorization header

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, approved, rejected)
- `category`: Filter by category (General, Technical, etc.)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback retrieved successfully.",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalFeedback": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/feedback/:id (Admin Only)
Retrieves a specific feedback entry by ID.

**Authentication Required**: JWT token in Authorization header

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback retrieved successfully.",
  "data": {
    "id": "feedback_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "category": "General",
    "rating": 5,
    "message": "This is a great service! Very helpful and responsive.",
    "status": "pending",
    "createdAt": "2023-12-23T10:30:00.000Z"
  }
}
```

### PATCH /api/feedback/:id (Admin Only)
Updates the status of a feedback entry.

**Authentication Required**: JWT token in Authorization header

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:**
- `pending`
- `approved`
- `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback status updated successfully.",
  "data": {
    "id": "feedback_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "category": "General",
    "rating": 5,
    "message": "This is a great service! Very helpful and responsive.",
    "status": "approved",
    "createdAt": "2023-12-23T10:30:00.000Z"
  }
}
```

### DELETE /api/feedback/:id (Admin Only)
Deletes a feedback entry by ID.

**Authentication Required**: JWT token in Authorization header

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback deleted successfully."
}
```

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Validation errors with detailed messages
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Invalid or expired token
- **404 Not Found**: Requested resource not found
- **409 Conflict**: Duplicate entry (for unique field violations)
- **500 Internal Server Error**: Server-side errors

## Security

- All admin routes require JWT authentication
- Input validation on all endpoints
- Protection against common security vulnerabilities
- Proper error message sanitization

## Usage Examples

### Submitting Feedback
```bash
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "category": "General",
    "rating": 5,
    "message": "Great service!"
  }'
```

### Retrieving Feedback (Admin)
```bash
curl -X GET "http://localhost:5000/api/feedback?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Validation Rules

The API enforces strict validation rules:

- **Name**: 2-50 characters, only letters, spaces, hyphens, and apostrophes
- **Email**: Valid email format, lowercase, max 100 characters
- **Category**: Must be one of the predefined values
- **Rating**: Integer between 1 and 5
- **Message**: 10-1000 characters
- **Status**: Must be one of: pending, approved, rejected

## Database Schema

Feedback entries follow the schema defined in the Feedback model, which includes validation, default values, and indexes for performance.