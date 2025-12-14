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

// Set admin email in navigation
function setAdminEmailInNav() {
    const email = getAdminEmail();
    const emailElement = document.getElementById('adminEmail');
    if (emailElement && email) {
        emailElement.textContent = email;
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

