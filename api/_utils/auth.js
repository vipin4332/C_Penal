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
        // Node 24 compatible: Buffer.from() works the same way
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const tokenData = JSON.parse(decoded);
        
        // Validate token structure
        if (!tokenData.email || !tokenData.timestamp) {
            return { authenticated: false };
        }
        
        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - (tokenData.timestamp || 0);
        if (tokenAge < 0 || tokenAge > 24 * 60 * 60 * 1000) {
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
    if (!email || typeof email !== 'string') {
        throw new Error('Email is required for token generation');
    }
    
    const tokenData = {
        email: String(email),
        timestamp: Date.now(),
        role: String(role || 'admin')
    };
    
    // Node 24 compatible: explicit encoding
    return Buffer.from(JSON.stringify(tokenData), 'utf8').toString('base64');
}

module.exports = {
    checkAuth,
    generateSimpleToken,
    isSuperAdmin
};

