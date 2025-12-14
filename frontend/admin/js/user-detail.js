/**
 * User Detail Page JavaScript
 * Loads and displays individual user details
 */

let currentUserId = null;
let currentUserData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Get user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentUserId = urlParams.get('id');
    
    if (!currentUserId) {
        showError('User ID not provided');
        return;
    }
    
    // Load user details
    loadUserDetails(currentUserId);
});

/**
 * Load user details from API
 */
async function loadUserDetails(userId) {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('userDetailsCard').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    try {
        const response = await authenticatedFetch(`/api/admin/user/${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load user details');
        }
        
        const user = await response.json();
        currentUserData = user;
        
        // Hide loading, show card
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('userDetailsCard').style.display = 'block';
        
        // Populate user details
        populateUserDetails(user);
        
    } catch (error) {
        console.error('Error loading user details:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        showError('Failed to load user details. Please try again.');
    }
}

/**
 * Populate user details in the UI
 */
function populateUserDetails(user) {
    // Personal Details
    document.getElementById('userName').textContent = user.name || '-';
    document.getElementById('userRollNumber').textContent = user.rollNumber || '-';
    document.getElementById('userDOB').textContent = formatDate(user.dateOfBirth || user.dob);
    document.getElementById('userGender').textContent = user.gender || '-';
    
    // Contact Details
    document.getElementById('userEmail').textContent = user.email || '-';
    document.getElementById('userMobile').textContent = user.mobile || user.phone || '-';
    document.getElementById('userAddress').textContent = user.address || '-';
    document.getElementById('userState').textContent = user.state || '-';
    document.getElementById('userCity').textContent = user.city || '-';
    document.getElementById('userPincode').textContent = user.pincode || user.pinCode || '-';
    
    // Education Details
    document.getElementById('userQualification').textContent = user.qualification || user.education || '-';
    document.getElementById('userInstitution').textContent = user.institution || user.college || '-';
    document.getElementById('userYear').textContent = user.yearOfPassing || user.passingYear || '-';
    
    // Registration Information
    document.getElementById('userRegDate').textContent = formatDate(user.createdAt || user.registrationDate || user.submissionDate);
    
    // Email Status
    const emailStatus = user.emailSent ? 'Email Sent' : 'Pending';
    const statusClass = user.emailSent ? 'sent' : 'pending';
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = emailStatus;
    statusBadge.className = `status-badge ${statusClass}`;
    
    // Admit Card Section
    const admitCardAvailable = document.getElementById('admitCardAvailable');
    const admitCardNotAvailable = document.getElementById('admitCardNotAvailable');
    
    if (user.pdfUrl) {
        admitCardAvailable.style.display = 'block';
        admitCardNotAvailable.style.display = 'none';
    } else {
        admitCardAvailable.style.display = 'none';
        admitCardNotAvailable.style.display = 'block';
    }
}

/**
 * Download admit card
 */
function downloadAdmitCard() {
    if (!currentUserData || !currentUserData.pdfUrl) {
        alert('Admit card not available yet.');
        return;
    }
    
    // Open PDF in new tab for download
    window.open(currentUserData.pdfUrl, '_blank');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

