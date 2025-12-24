const { parse } = require('json2csv');
const Feedback = require('../models/Feedback');

/**
 * Export Service for generating CSV/Excel files
 * Production-ready with async/await and error handling
 */
class ExportService {
    /**
     * Export feedback to CSV format
     */
    async exportToCSV(filters = {}) {
        try {
            // Build query based on filters
            const query = {};
            if (filters.status) query.status = filters.status;
            if (filters.category) query.category = filters.category;
            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
                if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
            }

            // Fetch data
            const feedbackList = await Feedback.find(query)
                .sort({ createdAt: -1 })
                .lean();

            if (feedbackList.length === 0) {
                return { success: false, message: 'No data to export' };
            }

            // Define CSV fields
            const fields = [
                { label: 'ID', value: '_id' },
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Category', value: 'category' },
                { label: 'Rating', value: 'rating' },
                { label: 'Message', value: 'message' },
                { label: 'Status', value: 'status' },
                { label: 'Submitted Date', value: (row) => new Date(row.createdAt).toLocaleString() }
            ];

            const csv = parse(feedbackList, { fields });

            return {
                success: true,
                data: csv,
                filename: `feedback_export_${Date.now()}.csv`,
                count: feedbackList.length
            };
        } catch (error) {
            console.error('Export error:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Generate summary statistics for export
     */
    async generateSummaryReport() {
        try {
            const stats = await Feedback.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [
                            { $group: { _id: '$status', count: { $sum: 1 } } }
                        ],
                        byCategory: [
                            { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
                        ],
                        avgRating: [
                            { $group: { _id: null, avg: { $avg: '$rating' } } }
                        ]
                    }
                }
            ]);

            return {
                success: true,
                data: stats[0]
            };
        } catch (error) {
            console.error('Summary report error:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new ExportService();
