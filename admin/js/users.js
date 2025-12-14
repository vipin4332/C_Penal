/**
 * Users List Page JavaScript
 * Handles user listing, search, and filters
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Load users on page load
    loadUsers();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load states for filter dropdown
    loadStates();
});

/**
 * Setup event listeners for search and filters
 */
function setupEventListeners() {
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter change listeners
    document.getElementById('stateFilter').addEventListener('change', function() {
        applyFilters();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function() {
        applyFilters();
    });
    
    document.getElementById('dateFrom').addEventListener('change', function() {
        applyFilters();
    });
    
    document.getElementById('dateTo').addEventListener('change', function() {
        applyFilters();
    });
}

/**
 * Load users from API
 */
async function loadUsers(page = 1) {
    currentPage = page;
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('usersTableBody').innerHTML = 
        '<tr><td colspan="8" class="text-center">Loading users...</td></tr>';
    
    try {
        // Build query parameters
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20', // 20 users per page
            ...currentFilters
        });
        
        const response = await authenticatedFetch(`/api/admin/users?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Update table
        displayUsers(data.users || []);
        
        // Update pagination
        totalPages = data.totalPages || 1;
        updatePagination(data.total || 0, data.page || 1, data.limit || 20);
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="8" class="text-center" style="color: var(--danger-color);">Error loading users. Please try again.</td></tr>';
    }
}

/**
 * Display users in table
 */
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const statusClass = user.emailSent ? 'sent' : 'pending';
        const statusText = user.emailSent ? 'Email Sent' : 'Pending';
        const submissionDate = formatDate(user.createdAt || user.submissionDate);
        
        return `
            <tr>
                <td>${user.rollNumber || '-'}</td>
                <td>${user.name || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>${user.mobile || '-'}</td>
                <td>${user.state || '-'}</td>
                <td>${submissionDate}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <a href="user-detail.html?id=${user._id || user.id}" class="action-btn view">View</a>
                    ${user.pdfUrl ? `<a href="${user.pdfUrl}" target="_blank" class="action-btn download">Download</a>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Perform search
 */
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (searchTerm) {
        currentFilters.search = searchTerm;
    } else {
        delete currentFilters.search;
    }
    
    currentPage = 1;
    loadUsers(currentPage);
}

/**
 * Apply filters
 */
function applyFilters() {
    const state = document.getElementById('stateFilter').value;
    const status = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    // Reset filters
    currentFilters = {};
    
    if (state) {
        currentFilters.state = state;
    }
    
    if (status) {
        currentFilters.status = status;
    }
    
    if (dateFrom) {
        currentFilters.dateFrom = dateFrom;
    }
    
    if (dateTo) {
        currentFilters.dateTo = dateTo;
    }
    
    // Also include search if present
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        currentFilters.search = searchTerm;
    }
    
    currentPage = 1;
    loadUsers(currentPage);
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('stateFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    currentFilters = {};
    currentPage = 1;
    loadUsers(currentPage);
}

/**
 * Load states for filter dropdown
 */
async function loadStates() {
    try {
        const response = await authenticatedFetch('/api/admin/states');
        
        if (response.ok) {
            const data = await response.json();
            const stateSelect = document.getElementById('stateFilter');
            
            // Add states to dropdown
            if (data.states && data.states.length > 0) {
                data.states.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading states:', error);
        // Continue without states - not critical
    }
}

/**
 * Update pagination controls
 */
function updatePagination(total, page, limit) {
    const paginationDiv = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = `<div class="pagination-info">Showing ${total} user(s)</div>`;
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="loadUsers(${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button onclick="loadUsers(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<span>...</span>`;
        }
    }
    
    // Next button
    html += `<button onclick="loadUsers(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next</button>`;
    
    // Info
    html += `<div class="pagination-info">Showing ${((page - 1) * limit) + 1} - ${Math.min(page * limit, total)} of ${total} users</div>`;
    
    paginationDiv.innerHTML = html;
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
        day: 'numeric'
    });
}

