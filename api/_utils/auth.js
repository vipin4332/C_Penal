/**
 * Shared Authentication Utility
 * Used by all admin API endpoints
 * 
 * TODO: Replace with proper JWT verification in production
 */

/**
 * Check if request is authenticated
 * @param {Object} req - Request object
 * @returns {Object} - { authenticated: boolean, email?: string }
 */
function checkAuth(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false };
    }
    
    const token = authHeader.substring(7);
    
    try {
        // Simple token decode (replace with JWT verify in production)
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - tokenData.timestamp;
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return { authenticated: false };
        }
        
        return { 
            authenticated: true, 
            email: tokenData.email,
            role: tokenData.role || 'admin'
        };
    } catch (error) {
        return { authenticated: false };
    }
}

/**
 * Check if user is super admin
 * @param {Object} req - Request object
 * @returns {boolean} - True if super admin
 */
function isSuperAdmin(req) {
    const authResult = checkAuth(req);
    return authResult.authenticated && authResult.role === 'super_admin';
}

/**
 * Generate simple token (replace with JWT in production)
 * @param {string} email - Admin email
 * @param {string} role - User role (admin or super_admin)
 * @returns {string} - Base64 encoded token
 */
function generateSimpleToken(email, role = 'admin') {
    const tokenData = {
        email: email,
        timestamp: Date.now(),
        role: role
    };
    
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

module.exports = {
    checkAuth,
    generateSimpleToken,
    isSuperAdmin
};

