const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
  submitFeedback, 
  getAllFeedback, 
  getFeedbackById, 
  updateFeedbackStatus, 
  deleteFeedback,
  getAnalytics,
  getDashboardStats,
  getCategoryDistribution,
  exportFeedbackToCSV,
  getAuditLogs
} = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Feedback Routes
 * IMPORTANT: Static routes must come BEFORE dynamic :id routes
 */

// Validation middleware for feedback submission
const validateFeedback = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  
  body('category')
    .isIn(['General', 'Technical', 'Sales', 'Support', 'Billing', 'Other'])
    .withMessage('Category must be one of: General, Technical, Sales, Support, Billing, Other'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// ============================================
// STATIC ROUTES (must be defined FIRST)
// ============================================

// POST /api/feedback/submit - Submit new feedback
router.post('/submit', validateFeedback, submitFeedback);

// GET /api/feedback/analytics - Get feedback analytics (admin only)
router.get('/analytics', authenticateToken, getAnalytics);

// GET /api/dashboard/stats - Dashboard statistics (admin only)
router.get('/dashboard/stats', authenticateToken, getDashboardStats);

// GET /api/admin/dashboard/stats - Dashboard statistics (admin only)
router.get('/admin/dashboard/stats', authenticateToken, getDashboardStats);

// GET /api/admin/dashboard/category-distribution - Category distribution (admin only)
router.get('/admin/dashboard/category-distribution', authenticateToken, getCategoryDistribution);

// GET /api/feedback - Get all feedback (admin only)
router.get('/', authenticateToken, getAllFeedback);

// GET /api/feedback/export - Export feedback to CSV (admin only)
router.get('/export', authenticateToken, exportFeedbackToCSV);

// GET /api/feedback/audit-logs - Get audit logs (admin only)
router.get('/audit-logs', authenticateToken, getAuditLogs);

// ============================================
// DYNAMIC ROUTES (must be defined AFTER static routes)
// ============================================

// PUT /api/feedback/:id/approve - Approve feedback (admin only)
router.put('/:id/approve', authenticateToken, (req, res) => {
  req.body.status = 'approved';
  updateFeedbackStatus(req, res);
});

// PUT /api/feedback/:id/reject - Reject feedback (admin only)
router.put('/:id/reject', authenticateToken, (req, res) => {
  req.body.status = 'rejected';
  updateFeedbackStatus(req, res);
});

// PATCH /api/feedback/:id - Update feedback status (admin only)
router.patch('/:id', authenticateToken, 
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be one of: pending, approved, rejected'),
  updateFeedbackStatus
);

// DELETE /api/feedback/:id - Delete feedback (admin only)
router.delete('/:id', authenticateToken, deleteFeedback);

// GET /api/feedback/:id - Get feedback by ID (admin only)
router.get('/:id', authenticateToken, getFeedbackById);

module.exports = router;
