const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Admin Authentication Controller
 * Handles admin login and JWT token generation with enhanced security
 */

/**
 * Admin login - validates credentials and returns JWT token
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation - check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Validate input format
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username and password must be strings.'
      });
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim().toLowerCase();
    
    // Validate username format
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters.'
      });
    }

    // Validate password length
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 128 characters.'
      });
    }

    // Find admin by username (case insensitive)
    const admin = await Admin.findOne({ 
      username: sanitizedUsername 
    });

    // Check if admin exists
    if (!admin) {
      // Use the same error message as for invalid password to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Compare provided password with hashed password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generate JWT token with proper security settings
    const token = jwt.sign(
      { 
        adminId: admin._id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET || 'fallback_secret_key_for_development_purpose_only_change_this_in_production',
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Default to 24 hours
        issuer: 'feedback-system',
        audience: admin._id.toString(),
        algorithm: 'HS256'
      }
    );

    // Remove sensitive data from response
    const { password: pwd, ...adminData } = admin.toObject();

    // Return success response with token and admin info (excluding sensitive data)
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: adminData._id,
        username: adminData.username,
        role: adminData.role,
        createdAt: adminData.createdAt
      }
    });
  } catch (error) {
    // Handle server errors
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

/**
 * Admin registration - creates a new admin account
 */
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Validate input types
    if (typeof username !== 'string' || typeof password !== 'string' || (role && typeof role !== 'string')) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and role must be strings.'
      });
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim().toLowerCase();
    
    // Validate username format
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters.'
      });
    }

    // Validate password length
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 128 characters.'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      username: sanitizedUsername 
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this username already exists.'
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      username: sanitizedUsername,
      password, // The schema will automatically hash this
      role: role || 'admin' // Default to 'admin' if no role provided
    });

    await newAdmin.save();

    // Generate JWT token with proper security settings
    const token = jwt.sign(
      { 
        adminId: newAdmin._id,
        username: newAdmin.username,
        role: newAdmin.role
      },
      process.env.JWT_SECRET || 'fallback_secret_key_for_development_purpose_only_change_this_in_production',
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'feedback-system',
        audience: newAdmin._id.toString(),
        algorithm: 'HS256'
      }
    );

    // Remove sensitive data from response
    const { password: pwd, ...adminData } = newAdmin.toObject();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      token,
      admin: {
        id: adminData._id,
        username: adminData.username,
        role: adminData.role,
        createdAt: adminData.createdAt
      }
    });
  } catch (error) {
    // Handle validation and server errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
};

/**
 * Verify admin token - checks if token is valid
 */
const verifyToken = async (req, res) => {
  try {
    // If we reach this point, the middleware has already verified the token
    // and attached the admin to req.admin
    
    // Remove sensitive data from response
    const { password: pwd, ...adminData } = req.admin.toObject();

    res.status(200).json({
      success: true,
      message: 'Token is valid.',
      admin: {
        id: adminData._id,
        username: adminData.username,
        role: adminData.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification.'
    });
  }
};

/**
 * Admin logout - currently just a placeholder since JWT is stateless
 * In a real application, you might want to implement token blacklisting
 */
const logout = async (req, res) => {
  try {
    // For stateless JWT, we typically don't do server-side logout
    // Instead, we can implement token blacklisting if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.'
    });
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  logout
};