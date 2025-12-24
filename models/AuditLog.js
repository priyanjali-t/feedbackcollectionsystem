const mongoose = require('mongoose');

/**
 * Audit Log Schema
 * Tracks all admin actions for compliance and security
 */
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['approve', 'reject', 'delete', 'create', 'update', 'login', 'logout']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['feedback', 'admin', 'system']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    adminUsername: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
