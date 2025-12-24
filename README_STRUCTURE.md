# Feedback Collection System - Folder Structure

## Industry-Standard Project Structure

```
FEEDBACK COLLECTION SYSTEM/
├── controllers/              # Business logic handlers
│   ├── feedbackController.js # Feedback-related operations
│   └── authController.js     # Authentication operations
├── models/                   # Database schemas/models
│   ├── Feedback.js           # Feedback schema
│   └── Admin.js              # Admin user schema
├── routes/                   # API route definitions
│   ├── feedbackRoutes.js     # Feedback routes
│   └── authRoutes.js         # Authentication routes
├── middleware/               # Custom middleware functions
│   └── auth.js               # Authentication middleware
├── config/                   # Configuration files
│   ├── database.js           # Database connection
│   └── seedAdmin.js          # Admin user seeding
├── public/                   # Static assets
│   ├── css/                  # Stylesheets
│   │   ├── style.css         # Main user styles
│   │   └── admin.css         # Admin dashboard styles
│   ├── js/                   # Client-side JavaScript
│   │   ├── main.js           # User form functionality
│   │   └── admin.js          # Admin dashboard functionality
│   └── images/               # Image assets
│       └── logo.png          # Project logo
├── .env                      # Environment variables
├── .gitignore                # Git ignore rules
├── server.js                 # Main application entry point
├── package.json              # Project dependencies and scripts
├── README.md                 # Project documentation
└── docs/                     # Additional documentation
    └── API.md                # API documentation
```

## Folder Explanations

### `controllers/`
- Contains business logic separated from route definitions
- Handles request processing, validation, and response formatting
- Keeps routes clean and focused on routing logic
- Examples: feedbackController.js, authController.js

### `models/`
- Contains Mongoose schemas for MongoDB collections
- Defines data structure, validation rules, and relationships
- Centralized location for all data models
- Examples: Feedback.js, Admin.js

### `routes/`
- Defines API endpoints and their corresponding controller functions
- Organizes routes by functionality or resource
- Keeps route definitions separate from business logic
- Examples: feedbackRoutes.js, authRoutes.js

### `middleware/`
- Contains reusable middleware functions
- Authentication, authorization, logging, error handling
- Custom validation and security middleware
- Examples: auth.js, errorHandlers.js

### `config/`
- Application configuration files
- Database connection setup
- Environment-specific configurations
- Third-party service configurations
- Examples: database.js, passport.js

### `public/`
- Static assets served to clients
- Frontend CSS, JavaScript, and image files
- Organized in subdirectories by asset type
- Directly accessible via HTTP requests

### `public/css/`
- Client-side stylesheets
- Separate files for different sections of the application
- Organized for maintainability and performance

### `public/js/`
- Client-side JavaScript files
- Frontend functionality and user interactions
- Separate files for different pages/components

### `public/images/`
- Static image assets
- Logos, icons, and other visual elements
- Optimized for web delivery

### Root Files
- `server.js`: Main application entry point
- `package.json`: Project metadata and dependencies
- `.env`: Environment variables (never committed to version control)
- `.gitignore`: Files and directories to exclude from Git

## Best Practices Followed

1. **Separation of Concerns**: Each folder has a specific responsibility
2. **Scalability**: Structure supports growth of the application
3. **Maintainability**: Clear organization makes code easier to manage
4. **Security**: Sensitive configuration kept separate
5. **Industry Standard**: Follows common Node.js/Express conventions
6. **Modularity**: Components can be developed and tested independently