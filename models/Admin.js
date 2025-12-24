const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Admin Schema
 * Defines the structure for admin users with secure password handling
 */
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [128, 'Password cannot exceed 128 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'moderator', 'super_admin'],
      message: 'Role must be either admin, moderator, or super_admin'
    },
    default: 'admin',
    required: [true, 'Role is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Pre-save middleware to hash password before saving
 */
adminSchema.pre('save', async function(next) {
  // Only hash password if it's modified (not on every save)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt with 12 rounds for strong security
    const salt = await bcrypt.genSalt(12);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

/**
 * Method to compare provided password with stored hash
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Index for username to improve search performance
adminSchema.index({ username: 1 });

module.exports = mongoose.model('Admin', adminSchema);