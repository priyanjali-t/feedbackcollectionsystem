/**
 * Admin Dashboard JavaScript
 * Handles dashboard stats, feedback actions, and real-time updates
 */

class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = { status: '', category: '', search: '' };
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLogin();
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        
        // Filters
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('prevPage')?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        
        // Export and Notification buttons
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportFeedback());
        document.getElementById('notifyBtn')?.addEventListener('click', () => this.requestNotificationPermission());
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    async verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('adminName').textContent = result.admin?.username || 'Admin';
                this.showDashboard();
                this.loadDashboardStats();
                this.loadFeedback();
            } else {
                this.showLogin();
                localStorage.removeItem('admin_token');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.showLogin();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;

        if (!username || !password) {
            this.showToast('Please enter username and password', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.token = result.token;
                localStorage.setItem('admin_token', this.token);
                document.getElementById('adminName').textContent = result.admin?.username || 'Admin';
                this.showDashboard();
                this.loadDashboardStats();
                this.loadFeedback();
                this.showToast('Login successful!', 'success');
            } else {
                this.showToast(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Network error', 'error');
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.token = null;
            localStorage.removeItem('admin_token');
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
    }

    // ============================================
    // DASHBOARD STATS - Core functionality
    // ============================================

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.updateDashboardCards(result.data);
                    this.renderCategoryChart(result.data.categoryDistribution || []);
                }
            } else {
                console.error('Failed to load dashboard stats');
            }
        } catch (error) {
            console.error('Dashboard stats error:', error);
        }
    }

    updateDashboardCards(data) {
        // Update each dashboard card with new values
        const totalEl = document.getElementById('totalFeedback');
        const avgEl = document.getElementById('avgRating');
        const pendingEl = document.getElementById('pendingCount');
        const approvedEl = document.getElementById('approvedCount');
        const rejectedEl = document.getElementById('rejectedCount');

        if (totalEl) totalEl.textContent = data.totalFeedback || 0;
        if (avgEl) avgEl.textContent = data.averageRating || '0.0';
        if (pendingEl) pendingEl.textContent = data.pendingCount || 0;
        if (approvedEl) approvedEl.textContent = data.approvedCount || 0;
        if (rejectedEl) rejectedEl.textContent = data.rejectedCount || 0;
    }

    // ============================================
    // FEEDBACK ACTIONS - Approve, Reject, Delete
    // ============================================

    async approveFeedback(id) {
        if (!confirm('Approve this feedback?')) return;

        try {
            const response = await fetch(`/api/feedback/${id}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update row status instantly
                this.updateRowStatus(id, 'approved');
                // Refresh dashboard stats
                await this.loadDashboardStats();
                // Refresh the feedback table to show updated status
                await this.loadFeedback(this.currentPage);
                this.showToast('Feedback approved', 'success');
            } else {
                this.showToast(result.message || 'Error approving', 'error');
            }
        } catch (error) {
            console.error('Approve error:', error);
            this.showToast('Network error', 'error');
        }
    }

    async rejectFeedback(id) {
        if (!confirm('Reject this feedback?')) return;

        try {
            const response = await fetch(`/api/feedback/${id}/reject`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update row status instantly
                this.updateRowStatus(id, 'rejected');
                // Refresh dashboard stats
                await this.loadDashboardStats();
                // Refresh the feedback table to show updated status
                await this.loadFeedback(this.currentPage);
                this.showToast('Feedback rejected', 'success');
            } else {
                this.showToast(result.message || 'Error rejecting', 'error');
            }
        } catch (error) {
            console.error('Reject error:', error);
            this.showToast('Network error', 'error');
        }
    }

    async deleteFeedback(id) {
        if (!confirm('Delete this feedback permanently?')) return;

        try {
            const response = await fetch(`/api/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Remove row from table instantly
                this.removeRow(id);
                // Refresh dashboard stats
                await this.loadDashboardStats();
                // Refresh the feedback table to show updated list
                await this.loadFeedback(this.currentPage);
                this.showToast('Feedback deleted', 'success');
            } else {
                this.showToast(result.message || 'Error deleting', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Network error', 'error');
        }
    }

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    async exportFeedback() {
        try {
            this.showToast('Preparing export...', 'info');

            const { status, category } = this.filters;
            const queryParams = new URLSearchParams();
            if (status) queryParams.append('status', status);
            if (category) queryParams.append('category', category);

            const response = await fetch(`/api/feedback/export?${queryParams}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `feedback_export_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                this.showToast('Export successful!', 'success');
            } else {
                const result = await response.json();
                this.showToast(result.message || 'Export failed', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Export failed', 'error');
        }
    }

    // ============================================
    // BROWSER NOTIFICATIONS
    // ============================================

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    showBrowserNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
    }

    // ============================================
    // DOM UPDATES - Instant UI changes
    // ============================================

    updateRowStatus(id, newStatus) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const statusCell = row.querySelector('.status-cell');
            if (statusCell) {
                statusCell.textContent = newStatus;
                statusCell.className = `status-cell status-${newStatus}`;
            }
        }
    }

    removeRow(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
        }
    }

    // ============================================
    // FEEDBACK TABLE
    // ============================================

    async loadFeedback(page = 1) {
        this.currentPage = page;

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                ...(this.filters.status && { status: this.filters.status }),
                ...(this.filters.category && { category: this.filters.category }),
                ...(this.filters.search && { search: this.filters.search })
            });

            const response = await fetch(`/api/feedback?${params}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.renderFeedbackTable(result.data);
                    this.updatePagination(result.pagination);
                }
            }
        } catch (error) {
            console.error('Load feedback error:', error);
        }
    }

    renderFeedbackTable(feedbackList) {
        const tbody = document.getElementById('feedbackTableBody');
        if (!tbody) return;

        if (!feedbackList || feedbackList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No feedback found</td></tr>';
            return;
        }

        // Create table rows HTML without inline onclick
        tbody.innerHTML = feedbackList.map(fb => {
            const date = new Date(fb.createdAt).toLocaleDateString();
            const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
            
            return `
                <tr data-id="${fb._id}">
                    <td>${this.escapeHtml(fb.name)}</td>
                    <td>${this.escapeHtml(fb.email)}</td>
                    <td>${this.escapeHtml(fb.category)}</td>
                    <td class="rating-stars">${stars}</td>
                    <td>${this.escapeHtml(fb.message.substring(0, 50))}${fb.message.length > 50 ? '...' : ''}</td>
                    <td class="status-cell status-${fb.status}">${fb.status}</td>
                    <td>${date}</td>
                    <td class="actions-cell">
                        <button class="action-btn approve-btn" data-id="${fb._id}" data-action="approve">Approve</button>
                        <button class="action-btn reject-btn" data-id="${fb._id}" data-action="reject">Reject</button>
                        <button class="action-btn delete-btn" data-id="${fb._id}" data-action="delete">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners to the buttons
        this.addEventListenersToButtons();
    }
    
    addEventListenersToButtons() {
        // Remove previous event listeners to avoid duplicates
        document.querySelectorAll('.action-btn').forEach(button => {
            // If listener was already attached, skip
            if (button.dataset.listenerAttached) return;
            
            button.addEventListener('click', (e) => {
                const button = e.target;
                const id = button.dataset.id;
                const action = button.dataset.action;
                
                switch(action) {
                    case 'approve':
                        this.approveFeedback(id);
                        break;
                    case 'reject':
                        this.rejectFeedback(id);
                        break;
                    case 'delete':
                        this.deleteFeedback(id);
                        break;
                }
            });
            
            // Mark that listener is attached
            button.dataset.listenerAttached = 'true';
        });
    }

    // ============================================
    // CHART.JS - Category Distribution
    // ============================================

    renderCategoryChart(categoryData) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Safely destroy existing chart
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
            window.categoryChartInstance = null;
        }

        // Handle empty data
        if (!categoryData || categoryData.length === 0) {
            this.showEmptyChart(ctx, canvas);
            return;
        }

        // Prepare chart data
        const labels = categoryData.map(item => item.category || 'Unknown');
        const data = categoryData.map(item => item.count);
        const colors = [
            'rgba(52, 152, 219, 0.8)',   // Blue
            'rgba(231, 76, 60, 0.8)',    // Red
            'rgba(241, 196, 15, 0.8)',   // Yellow
            'rgba(46, 204, 113, 0.8)',   // Green
            'rgba(155, 89, 182, 0.8)',   // Purple
            'rgba(230, 126, 34, 0.8)'    // Orange
        ];
        const borderColors = colors.map(c => c.replace('0.8', '1'));

        // Create new chart
        window.categoryChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Feedback Count',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Feedback by Category',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0, stepSize: 1 }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    showEmptyChart(ctx, canvas) {
        // Clear canvas and show "No Data" message
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('No category data available', canvas.width / 2, canvas.height / 2);
    }

    // Update chart after any feedback action
    async updateChart() {
        try {
            const response = await fetch('/api/dashboard/stats', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.categoryDistribution) {
                    this.renderCategoryChart(result.data.categoryDistribution);
                }
            }
        } catch (error) {
            console.error('Chart update error:', error);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    applyFilters() {
        this.filters.status = document.getElementById('statusFilter')?.value || '';
        this.filters.category = document.getElementById('categoryFilter')?.value || '';
        this.filters.search = document.getElementById('searchInput')?.value.trim() || '';
        this.loadFeedback(1);
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.loadFeedback(page);
        }
    }

    updatePagination(pagination) {
        if (!pagination) return;
        this.totalPages = pagination.totalPages || 1;
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) pageInfo.textContent = `Page ${pagination.currentPage} of ${this.totalPages}`;
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.disabled = pagination.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = pagination.currentPage >= this.totalPages;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    showToast(message, type) {
        const existing = document.querySelectorAll('.toast-notification');
        existing.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `${message}<button onclick="this.parentElement.remove()">&times;</button>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 4000);
    }
}

// Initialize on page load - make it globally accessible
window.adminDashboard = null;
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});