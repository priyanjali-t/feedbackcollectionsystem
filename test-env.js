require('dotenv').config();
console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'Not found');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('PORT') || key.includes('JWT') || key.includes('ADMIN') || key.includes('NODE')));