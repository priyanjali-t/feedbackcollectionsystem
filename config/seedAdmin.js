const Admin = require('../models/Admin');

/**
 * Admin Seeding Script
 * Creates an initial admin user if one doesn't exist
 */
const seedAdmin = async () => {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      username: process.env.ADMIN_USERNAME || 'admin' 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Create default admin user - password will be hashed by the model's pre-save hook
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    console.log('Creating default admin user...');
    
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: defaultPassword, // Don't hash manually - the pre-save hook will do it
      role: 'admin'
    });

    await admin.save();
    console.log('Default admin user created successfully!');
    console.log('Username:', process.env.ADMIN_USERNAME || 'admin');
    console.log('Password: admin123 (default)');
  } catch (error) {
    console.error('Error seeding admin:', error);
    throw error;
  }
};

module.exports = { seedAdmin };