/**
 * Dashboard Page JavaScript
 * Loads and displays statistics
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Load dashboard statistics
    loadDashboardStats();
});

/**
 * Load dashboard statistics from API
 */
async function loadDashboardStats() {
    try {
        const response = await authenticatedFetch('/api/admin/dashboard');
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const data = await response.json();
        
        // Update statistics cards
        document.getElementById('totalRegistrations').textContent = 
            formatNumber(data.totalRegistrations || 0);
        document.getElementById('todayRegistrations').textContent = 
            formatNumber(data.todayRegistrations || 0);
        document.getElementById('emailsSent').textContent = 
            formatNumber(data.emailsSent || 0);
        document.getElementById('pendingEmails').textContent = 
            formatNumber(data.pendingEmails || 0);
            
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Show error message or keep default values
        showError('Failed to load statistics. Please refresh the page.');
    }
}

/**
 * Refresh statistics
 */
function refreshStats() {
    loadDashboardStats();
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Show error message
 */
function showError(message) {
    // You can implement a toast notification here
    alert(message);
}

