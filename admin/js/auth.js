/**
 * Authentication Utility Functions
 * Handles admin login state and session management
 */

// Check if user is authenticated
function checkAuth() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    // Clear session storage
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminEmail');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Get auth token for API requests
function getAuthToken() {
    return sessionStorage.getItem('adminToken');
}

// Get admin email
function getAdminEmail() {
    return sessionStorage.getItem('adminEmail');
}

// Get admin role
function getAdminRole() {
    return sessionStorage.getItem('adminRole') || 'admin';
}

// Check if user is super admin
function isSuperAdmin() {
    return getAdminRole() === 'super_admin';
}

// Set admin email in navigation
function setAdminEmailInNav() {
    const email = getAdminEmail();
    const emailElement = document.getElementById('adminEmail');
    if (emailElement && email) {
        emailElement.textContent = email;
    }
    
    // Show/hide approvals link based on role
    const approvalsLink = document.getElementById('approvalsLink') || document.querySelector('a[href="approvals.html"]');
    if (approvalsLink) {
        if (isSuperAdmin()) {
            approvalsLink.style.display = 'inline-block';
        } else {
            approvalsLink.style.display = 'none';
        }
    }
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = 'index.html';
        throw new Error('Not authenticated');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
        logout();
        throw new Error('Session expired');
    }
    
    return response;
}

// Initialize auth check on page load (for protected pages)
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check on login page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname.endsWith('/') && !document.querySelector('.login-page')) {
        return;
    }
    
    // Check authentication for all other pages
    if (checkAuth()) {
        setAdminEmailInNav();
    }
});

