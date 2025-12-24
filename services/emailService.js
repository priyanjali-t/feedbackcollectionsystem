const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service for sending notifications
 * Production-ready with async/await and error handling
 */
class EmailService {
    constructor() {
        // Check if email is configured
        if (!process.env.EMAIL_USER) {
            console.log('Email service not configured. Email notifications will be skipped.');
            this.transporter = null;
            return;
        }

        try {
            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        } catch (error) {
            console.error('Failed to create email transporter:', error.message);
            this.transporter = null;
        }
    }

    /**
     * Send email when new feedback is submitted
     */
    async sendNewFeedbackNotification(feedback) {
        if (!this.transporter || !process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
            console.log('Email service not configured. Skipping email notification.');
            return { success: false, message: 'Email not configured' };
        }

        try {
            const mailOptions = {
                from: `"Feedback System" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `New Feedback Received - ${feedback.category}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3498db;">New Feedback Submitted</h2>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                            <p><strong>Name:</strong> ${feedback.name}</p>
                            <p><strong>Email:</strong> ${feedback.email}</p>
                            <p><strong>Category:</strong> ${feedback.category}</p>
                            <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5)</p>
                            <p><strong>Message:</strong></p>
                            <p style="background-color: white; padding: 10px; border-left: 3px solid #3498db;">${feedback.message}</p>
                            <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
                        </div>
                        <p style="margin-top: 20px; color: #7f8c8d;">
                            <a href="${process.env.APP_URL || 'http://localhost:5008'}/admin" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
                        </p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send email when feedback is approved
     */
    async sendFeedbackApprovedNotification(feedback) {
        if (!this.transporter || !process.env.EMAIL_USER) {
            return { success: false, message: 'Email not configured' };
        }

        try {
            const mailOptions = {
                from: `"Feedback System" <${process.env.EMAIL_USER}>`,
                to: feedback.email,
                subject: 'Your Feedback Has Been Approved',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">✅ Feedback Approved</h2>
                        <p>Dear ${feedback.name},</p>
                        <p>Thank you for your feedback! We're pleased to inform you that your feedback has been reviewed and approved.</p>
                        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Category:</strong> ${feedback.category}</p>
                            <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}</p>
                            <p><strong>Your Message:</strong></p>
                            <p style="font-style: italic;">"${feedback.message}"</p>
                        </div>
                        <p>We appreciate your input and will use it to improve our services.</p>
                        <p style="color: #7f8c8d; margin-top: 30px;">Best regards,<br>The Team</p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send email when feedback is rejected
     */
    async sendFeedbackRejectedNotification(feedback) {
        if (!this.transporter || !process.env.EMAIL_USER) {
            return { success: false, message: 'Email not configured' };
        }

        try {
            const mailOptions = {
                from: `"Feedback System" <${process.env.EMAIL_USER}>`,
                to: feedback.email,
                subject: 'Regarding Your Recent Feedback',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e74c3c;">Feedback Status Update</h2>
                        <p>Dear ${feedback.name},</p>
                        <p>Thank you for taking the time to submit your feedback. After review, we've determined that it doesn't meet our current guidelines.</p>
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Category:</strong> ${feedback.category}</p>
                            <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p>If you have questions or would like to submit revised feedback, please feel free to contact us.</p>
                        <p style="color: #7f8c8d; margin-top: 30px;">Best regards,<br>The Team</p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
