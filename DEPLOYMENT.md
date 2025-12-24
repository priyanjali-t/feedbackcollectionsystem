# 🚀 Feedback Collection System - Deployment Guide

## 📋 **Deployment Checklist**

### ✅ **System Requirements**
- Node.js v14+ (v16+ recommended)
- MongoDB v4.0+ (local or cloud)
- npm or yarn package manager

### ✅ **Environment Configuration**
```env
# Production environment
NODE_ENV=production

# Server configuration
PORT=8080  # Use 80 for HTTP, 443 for HTTPS in production

# Database (use MongoDB Atlas for cloud deployment)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feedback_system?retryWrites=true&w=majority

# Security
JWT_SECRET=your_very_secure_production_secret_key_here_change_this_to_a_long_random_string_for_production
JWT_EXPIRES_IN=7d  # 7 days for production

# Admin credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Email configuration (optional but recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=notifications@yourdomain.com
```

### ✅ **Production Dependencies**
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.0",
    "helmet": "^7.0.0",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "nodemailer": "^7.0.12",
    "json2csv": "^6.0.0-alpha.2",
    "validator": "^13.11.0",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🚀 **Deployment Options**

### **Option 1: Heroku Deployment**

1. **Create Heroku account** at https://heroku.com

2. **Install Heroku CLI:**
```bash
# Windows
choco install heroku-cli

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

3. **Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-feedback-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set ADMIN_USERNAME=your_admin
heroku config:set ADMIN_PASSWORD=your_password

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### **Option 2: Railway Deployment**

1. **Create Railway account** at https://railway.app

2. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

3. **Deploy:**
```bash
# Login
railway login

# Create project
railway init

# Link to project
railway link

# Deploy
railway up
```

### **Option 3: Vercel/Now (with external MongoDB)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
# Login
vercel login

# Deploy
vercel --env NODE_ENV=production --env MONGODB_URI=your_mongo_uri --env JWT_SECRET=your_secret
```

### **Option 4: DigitalOcean App Platform**

1. **Create DigitalOcean account**
2. **Connect your GitHub repository**
3. **Set environment variables in the dashboard**
4. **Deploy automatically on push**

---

## 🛠️ **Manual Deployment Steps**

### **Step 1: Prepare for Production**

1. **Create production build:**
```bash
# Install production dependencies only
npm ci --only=production

# Or if using yarn
yarn install --production
```

2. **Create production config:**
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
ADMIN_USERNAME=your_admin
ADMIN_PASSWORD=your_secure_password
```

### **Step 2: Server Setup**

1. **Create server.js for production:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedback');
const authRoutes = require('./routes/auth');
const { seedAdmin } = require('./config/seedAdmin');

const app = express();
const PORT = process.env.PORT || 8080;

// Production security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://*.mongodb.net"],
      frameSrc: ["'self'"]
    },
  },
}));

// CORS for production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['https://yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(require('express-mongo-sanitize')());
app.use(require('xss-clean')());
app.use(require('hpp')());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Additional rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Dashboard stats route
const { getDashboardStats } = require('./controllers/feedbackController');
const { authenticateToken } = require('./middleware/auth');
app.get('/api/dashboard/stats', authenticateToken, getDashboardStats);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Production error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
```

### **Step 3: Process Manager Setup**

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Create PM2 ecosystem file:**
```json
{
  "apps": [
    {
      "name": "feedback-system",
      "script": "server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": "8080"
      },
      "error_file": "logs/err.log",
      "out_file": "logs/out.log",
      "log_file": "logs/combined.log",
      "time": true
    }
  ]
}
```

3. **Start with PM2:**
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Start PM2 on system boot
pm2 startup

# Monitor application
pm2 monit
```

---

## 🌐 **Cloud Deployment Services**

### **Heroku (Recommended for beginners)**
- **Pros:** Easy setup, free tier available
- **Cons:** Limited performance on free tier
- **Setup:** Follow Option 1 above

### **Railway (Modern alternative)**
- **Pros:** Great performance, generous free tier
- **Cons:** Newer platform
- **Setup:** Follow Option 2 above

### **DigitalOcean App Platform**
- **Pros:** Excellent performance, competitive pricing
- **Cons:** Requires credit card for verification
- **Setup:** Connect GitHub repo and set environment variables

### **AWS Elastic Beanstalk**
- **Pros:** High performance, scalable
- **Cons:** More complex setup
- **Setup:** Create EB CLI and deploy

---

## 🔐 **Security Best Practices**

### **Environment Variables**
- ✅ Never commit `.env` files to version control
- ✅ Use strong, unique secrets for JWT
- ✅ Use different credentials for different environments

### **Database Security**
- ✅ Use MongoDB Atlas with IP whitelisting
- ✅ Enable database authentication
- ✅ Use connection string with credentials

### **Application Security**
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Implement proper rate limiting
- ✅ Sanitize all user inputs

---

## 📊 **Monitoring & Maintenance**

### **Health Checks**
- **Endpoint:** `GET /api/health` (add this route)
- **Response:** `{ "status": "ok", "timestamp": "..." }`

### **Logging**
- Use Winston for production logging
- Monitor error logs regularly
- Set up alerts for critical errors

### **Performance**
- Monitor response times
- Track database query performance
- Implement caching if needed

---

## 🚀 **Post-Deployment Checklist**

- [ ] Application is accessible at domain
- [ ] Admin login works
- [ ] Feedback submission works
- [ ] All buttons function correctly
- [ ] Database connections are secure
- [ ] SSL certificate is installed (if HTTPS)
- [ ] Error monitoring is set up
- [ ] Backup strategy is in place
- [ ] Performance monitoring is active

---

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Database Connection:** Check MongoDB URI and credentials
2. **Environment Variables:** Ensure all required vars are set
3. **Port Issues:** Use environment PORT variable
4. **CORS Issues:** Configure allowed origins properly

### **Contact Support:**
- Check logs first: `pm2 logs` or platform-specific logs
- Verify environment configuration
- Test locally before deploying

---

**🎉 Your Feedback Collection System is ready for production deployment!**

Choose the deployment option that best fits your needs and budget. The system is fully functional with all features working properly.