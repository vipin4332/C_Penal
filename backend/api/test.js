/**
 * Test API Endpoint
 * GET /api/test
 * Used to verify Vercel deployment is working
 */

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    return res.status(200).json({
        success: true,
        message: 'Backend API is working!',
        timestamp: new Date().toISOString(),
        environment: {
            hasMongoUri: !!process.env.MONGODB_URI,
            dbName: process.env.DB_NAME || 'not set',
            nodeEnv: process.env.NODE_ENV || 'not set'
        }
    });
};

