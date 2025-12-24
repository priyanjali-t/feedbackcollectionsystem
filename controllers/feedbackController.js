const Feedback = require('../models/Feedback');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const exportService = require('../services/exportService');

/**
 * Feedback Controller
 * Handles all business logic for feedback operations
 */

/**
 * Submit feedback - validates input and saves to database
 */
const submitFeedback = async (req, res) => {
  try {
    // Validate request body using express-validator results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array().map(error => error.msg)
      });
    }

    const { name, email, category, rating, message } = req.body;

    // Create new feedback instance
    const newFeedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category,
      rating: parseInt(rating),
      message: message.trim()
    });

    // Save feedback to database
    const savedFeedback = await newFeedback.save();

    // Send email notification to admin (non-blocking)
    emailService.sendNewFeedbackNotification(savedFeedback)
      .catch(err => console.error('Email notification error:', err));

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: {
        id: savedFeedback._id,
        name: savedFeedback.name,
        email: savedFeedback.email,
        category: savedFeedback.category,
        rating: savedFeedback.rating,
        message: savedFeedback.message,
        status: savedFeedback.status,
        createdAt: savedFeedback.createdAt
      }
    });
  } catch (error) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Feedback submission failed due to duplicate entry.'
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors
      });
    }

    // Log server error for debugging
    console.error('Error submitting feedback:', error);
    
    // Return generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback submission.'
    });
  }
};

/**
 * Get all feedback - retrieves feedback with optional filtering
 */
const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Add search functionality if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch feedback with pagination
    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully.',
      data: feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalFeedback: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback retrieval.'
    });
  }
};

/**
 * Get feedback by ID
 */
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully.',
      data: feedback
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format.'
      });
    }

    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback retrieval.'
    });
  }
};

/**
 * Update feedback status - for admin moderation
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: pending, approved, rejected.'
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return updated document
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    // Create audit log
    try {
      await AuditLog.create({
        action: status === 'approved' ? 'approve' : 'reject',
        entityType: 'feedback',
        entityId: id,
        adminId: req.user.id,
        adminUsername: req.user.username,
        details: { status, feedbackCategory: updatedFeedback.category },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    // Send email notification to user (non-blocking)
    if (status === 'approved') {
      emailService.sendFeedbackApprovedNotification(updatedFeedback)
        .catch(err => console.error('Email error:', err));
    } else if (status === 'rejected') {
      emailService.sendFeedbackRejectedNotification(updatedFeedback)
        .catch(err => console.error('Email error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully.',
      data: updatedFeedback
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format.'
      });
    }

    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback status update.'
    });
  }
};

/**
 * Delete feedback by ID
 */
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    // Create audit log
    try {
      await AuditLog.create({
        action: 'delete',
        entityType: 'feedback',
        entityId: id,
        adminId: req.user.id,
        adminUsername: req.user.username,
        details: { 
          deletedName: deletedFeedback.name,
          deletedCategory: deletedFeedback.category,
          deletedStatus: deletedFeedback.status
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.'
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format.'
      });
    }

    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback deletion.'
    });
  }
};

/**
 * Get analytics data - total feedback, average rating, category count
 */
const getAnalytics = async (req, res) => {
  try {
    // Get total feedback count
    const totalFeedback = await Feedback.countDocuments();

    // Get average rating
    const avgRatingResult = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    
    const averageRating = avgRatingResult.length > 0 ? 
      parseFloat(avgRatingResult[0].averageRating.toFixed(2)) : 0;

    // Get feedback count by category
    const categoryCount = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get feedback count by status
    const statusCount = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully.',
      data: {
        totalFeedback,
        averageRating,
        categoryCount: categoryCount.map(item => ({
          category: item._id,
          count: item.count
        })),
        statusCount: statusCount.map(item => ({
          status: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during analytics retrieval.'
    });
  }
};

/**
 * Get dashboard statistics - Production Ready
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Single aggregation pipeline for all stats
    const statsResult = await Feedback.aggregate([
      {
        $facet: {
          // Total count
          total: [{ $count: 'count' }],
          
          // Average rating
          avgRating: [
            {
              $group: {
                _id: null,
                avg: { $avg: '$rating' }
              }
            }
          ],
          
          // Status counts
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          
          // Category distribution
          categoryDistribution: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    const result = statsResult[0];

    // Extract total feedback count (handle empty database)
    const totalFeedback = result.total.length > 0 ? result.total[0].count : 0;

    // Extract average rating (handle empty database)
    const averageRating = result.avgRating.length > 0 && result.avgRating[0].avg !== null
      ? parseFloat(result.avgRating[0].avg.toFixed(2))
      : 0;

    // Extract status counts (handle missing statuses)
    const statusMap = { pending: 0, approved: 0, rejected: 0 };
    result.statusCounts.forEach(item => {
      if (item._id && statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    // Extract category distribution
    const categoryDistribution = result.categoryDistribution.map(item => ({
      category: item._id || 'Unknown',
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        averageRating,
        pendingCount: statusMap.pending,
        approvedCount: statusMap.approved,
        rejectedCount: statusMap.rejected,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};

/**
 * Get category distribution - number of feedback entries per category
 */
const getCategoryDistribution = async (req, res) => {
  try {
    const categoryDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by count in descending order
      }
    ]);

    // Convert to array of objects with category and count
    const distribution = categoryDistribution.map(item => ({
      category: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      message: 'Category distribution retrieved successfully.',
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during category distribution retrieval.'
    });
  }
};

/**
 * Export feedback to CSV
 */
const exportFeedbackToCSV = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await exportService.exportToCSV(filters);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    // Create audit log
    try {
      await AuditLog.create({
        action: 'export',
        entityType: 'feedback',
        adminId: req.user.id,
        adminUsername: req.user.username,
        details: { exportCount: result.count, filters },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export feedback.'
    });
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, adminId } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (adminId) filter.adminId = adminId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Audit log fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.'
    });
  }
};

module.exports = {
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
};