/**
 * Pending Admin Users API Endpoint
 * GET /api/admin/pending-users
 * 
 * Returns list of admin users waiting for approval
 * Only accessible by super_admin
 */

const { MongoClient } = require('mongodb');
const { checkAuth, isSuperAdmin } = require('../_utils/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION || 'admins';

module.exports = async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check authentication
    const authResult = checkAuth(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is super admin
    if (!isSuperAdmin(req)) {
        return res.status(403).json({ 
            message: 'Access denied. Super admin privileges required.' 
        });
    }

    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        // Find all pending users (not approved)
        const pendingUsers = await collection
            .find({ 
                approved: { $ne: true } 
            })
            .sort({ createdAt: -1 }) // Newest first
            .toArray();

        // Format response (exclude password)
        const formattedUsers = pendingUsers.map(user => ({
            _id: user._id.toString(),
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'admin',
            createdAt: user.createdAt,
            requestDate: user.createdAt
        }));

        return res.status(200).json({
            users: formattedUsers,
            count: formattedUsers.length
        });

    } catch (error) {
        console.error('Pending users API error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

