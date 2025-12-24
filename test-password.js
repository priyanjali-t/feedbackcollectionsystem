const mongoose = require('mongoose');
require('dotenv').config();

async function testPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/feedback_system');
    const Admin = require('./models/Admin');
    const admin = await Admin.findOne({username: 'admin'});
    
    if (admin) {
      console.log('Admin found:', admin.username);
      console.log('Password field exists:', !!admin.password);
      console.log('Password length:', admin.password ? admin.password.length : 'N/A');
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log('Password comparison result for "admin123":', isMatch);
      
      const isWrong = await bcrypt.compare('wrongpassword', admin.password);
      console.log('Password comparison result for "wrongpassword":', isWrong);
    } else {
      console.log('No admin found');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

testPassword();