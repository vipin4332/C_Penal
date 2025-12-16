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
    
    // Environment variable checks
    const envStatus = {
        MONGODB_URI: !!process.env.MONGODB_URI,
        DB_NAME: !!process.env.DB_NAME,
        COLLECTION_NAME: !!process.env.COLLECTION_NAME,
        ADMIN_COLLECTION: !!process.env.ADMIN_COLLECTION,
        NODE_ENV: process.env.NODE_ENV || 'not set'
    };
    
    // Node version info
    const nodeVersion = process.version;
    
    return res.status(200).json({
        success: true,
        message: 'Backend API is working!',
        timestamp: new Date().toISOString(),
        environment: {
            nodeVersion: nodeVersion,
            hasMongoUri: envStatus.MONGODB_URI,
            dbName: process.env.DB_NAME || 'not set',
            collectionName: process.env.COLLECTION_NAME || 'not set',
            adminCollection: process.env.ADMIN_COLLECTION || 'not set',
            nodeEnv: envStatus.NODE_ENV,
            envStatus: envStatus
        }
    });
};
