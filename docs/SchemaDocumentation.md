# Schema Documentation

## Admin Schema

The Admin schema defines the structure for admin users in the feedback collection system.

### Fields

- **`username`** (String)
  - Required: Yes
  - Unique: Yes
  - Validation: 3-30 characters, lowercase, alphanumeric + underscore only
  - Description: The admin's unique login identifier

- **`password`** (String)
  - Required: Yes
  - Validation: 6-128 characters
  - Description: The admin's password (automatically hashed using bcrypt before saving)

- **`role`** (String)
  - Required: Yes
  - Default: 'admin'
  - Enum values: 'admin', 'moderator', 'super_admin'
  - Description: The admin's role which determines their permissions

- **`createdAt`** (Date)
  - Automatically added by timestamps option
  - Description: The date and time when the admin account was created

- **`updatedAt`** (Date)
  - Automatically added by timestamps option
  - Description: The date and time when the admin account was last updated

### Additional Features

- **Password Hashing**: Passwords are automatically hashed using bcrypt with 12 rounds before saving
- **Password Comparison**: Includes a method to compare provided passwords with the stored hash
- **Indexes**: Username field is indexed for faster lookups

---

## Feedback Schema

The Feedback schema defines the structure for feedback entries in the system.

### Fields

- **`name`** (String)
  - Required: Yes
  - Validation: 2-50 characters, trimmed
  - Description: The name of the person submitting feedback

- **`email`** (String)
  - Required: Yes
  - Validation: Valid email format, lowercase, max 100 characters
  - Description: The email address of the person submitting feedback

- **`category`** (String)
  - Required: Yes
  - Enum values: 'General', 'Technical', 'Sales', 'Support', 'Billing', 'Other'
  - Description: The category of the feedback

- **`rating`** (Number)
  - Required: Yes
  - Validation: 1-5 (inclusive)
  - Description: A numerical rating from 1 to 5

- **`message`** (String)
  - Required: Yes
  - Validation: 10-1000 characters, trimmed
  - Description: The detailed feedback message

- **`status`** (String)
  - Required: No
  - Default: 'pending'
  - Enum values: 'pending', 'approved', 'rejected'
  - Description: The current status of the feedback (pending review, approved, or rejected)

- **`createdAt`** (Date)
  - Automatically added by timestamps option
  - Description: The date and time when the feedback was submitted

- **`updatedAt`** (Date)
  - Automatically added by timestamps option
  - Description: The date and time when the feedback was last updated

### Additional Features

- **Indexes**: Status, category, creation date, and email fields are indexed for faster queries
- **Virtual Properties**: Includes formatted date and "is recent" helper properties
- **Validation**: Comprehensive validation on all fields to ensure data integrity