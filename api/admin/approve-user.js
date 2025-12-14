/**
 * Approve Admin User API Endpoint
 * POST /api/admin/approve-user
 * 
 * Approves a pending admin user
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

        // Get current user (super admin) email
        const superAdminEmail = authResult.email;

        // Update user to approved
        let updateResult;
        try {
            updateResult = await collection.updateOne(
                { _id: new ObjectId(userId) },
                { 
                    $set: { 
                        approved: true,
                        approvedAt: new Date(),
                        approvedBy: superAdminEmail
                    } 
                }
            );
        } catch (error) {
            // If ObjectId conversion fails, try as string
            updateResult = await collection.updateOne(
                { _id: userId },
                { 
                    $set: { 
                        approved: true,
                        approvedAt: new Date(),
                        approvedBy: superAdminEmail
                    } 
                }
            );
        }

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ 
                message: 'User may already be approved' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User approved successfully'
        });

    } catch (error) {
        console.error('Approve user API error:', error);
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

