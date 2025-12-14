/**
 * Reject Admin User API Endpoint
 * POST /api/admin/reject-user
 * 
 * Rejects and optionally deletes a pending admin user
 * Only accessible by super_admin
 */

const { MongoClient, ObjectId } = require('mongodb');
const { checkAuth, isSuperAdmin } = require('../_utils/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION || 'admins';

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
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
        const { userId } = req.body;

        // Validate input
        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required' 
            });
        }

        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        // Delete the user (reject = remove from database)
        let deleteResult;
        try {
            deleteResult = await collection.deleteOne({ _id: new ObjectId(userId) });
        } catch (error) {
            // If ObjectId conversion fails, try as string
            deleteResult = await collection.deleteOne({ _id: userId });
        }

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User request rejected and removed'
        });

    } catch (error) {
        console.error('Reject user API error:', error);
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

