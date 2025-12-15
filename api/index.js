/**
 * Root API Endpoint
 * GET /
 * Provides information about the API
 */

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    return res.status(200).json({
        success: true,
        message: 'Admin Control Panel API',
        version: '1.0.0',
        endpoints: {
            test: '/api/test',
            admin: {
                login: '/api/admin/login',
                signup: '/api/admin/signup',
                dashboard: '/api/admin/dashboard',
                users: '/api/admin/users',
                userDetail: '/api/admin/user/:id',
                pendingUsers: '/api/admin/pending-users',
                approveUser: '/api/admin/approve-user',
                rejectUser: '/api/admin/reject-user',
                states: '/api/admin/states'
            }
        },
        note: 'This is an API-only backend. Frontend is hosted on GitHub Pages.',
        timestamp: new Date().toISOString()
    });
};

