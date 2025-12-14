/**
 * Admin Approvals Page JavaScript
 * Handles loading and managing admin access requests
 */

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Load pending requests
    loadPendingRequests();
});

/**
 * Load pending admin requests
 */
async function loadPendingRequests() {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('requestsTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    try {
        const response = await authenticatedFetch('/api/admin/pending-users');
        
        if (!response.ok) {
            if (response.status === 403) {
                showError('Access denied. You need super admin privileges to view this page.');
                return;
            }
            throw new Error('Failed to load requests');
        }
        
        const data = await response.json();
        
        document.getElementById('loadingIndicator').style.display = 'none';
        
        if (data.users && data.users.length > 0) {
            displayRequests(data.users);
        } else {
            document.getElementById('emptyState').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading pending requests:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        showError('Failed to load requests. Please try again.');
    }
}

/**
 * Display pending requests in table
 */
function displayRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    const table = document.getElementById('requestsTable');
    
    tbody.innerHTML = requests.map(request => {
        const requestDate = formatDate(request.requestDate || request.createdAt);
        
        return `
            <tr>
                <td>${request.name || '-'}</td>
                <td>${request.email || '-'}</td>
                <td>${requestDate}</td>
                <td><span class="status-badge pending">Pending Approval</span></td>
                <td>
                    <button class="action-btn approve" onclick="approveUser('${request.id || request._id}', '${request.name || request.email}')">
                        Approve
                    </button>
                    <button class="action-btn reject" onclick="rejectUser('${request.id || request._id}', '${request.name || request.email}')">
                        Reject
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    table.style.display = 'block';
}

/**
 * Approve a user
 */
async function approveUser(userId, userName) {
    if (!confirm(`Are you sure you want to approve ${userName}?`)) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await authenticatedFetch('/api/admin/approve-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(`${userName} has been approved successfully.`);
            // Reload requests after 1 second
            setTimeout(() => {
                loadPendingRequests();
            }, 1000);
        } else {
            showError(data.message || 'Failed to approve user. Please try again.');
        }
        
    } catch (error) {
        console.error('Error approving user:', error);
        showError('Failed to approve user. Please try again.');
    }
}

/**
 * Reject a user
 */
async function rejectUser(userId, userName) {
    if (!confirm(`Are you sure you want to reject ${userName}'s request? This action cannot be undone.`)) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await authenticatedFetch('/api/admin/reject-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(`${userName}'s request has been rejected.`);
            // Reload requests after 1 second
            setTimeout(() => {
                loadPendingRequests();
            }, 1000);
        } else {
            showError(data.message || 'Failed to reject user. Please try again.');
        }
        
    } catch (error) {
        console.error('Error rejecting user:', error);
        showError('Failed to reject user. Please try again.');
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

/**
 * Hide all messages
 */
function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

