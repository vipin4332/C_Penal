/**
 * Dashboard Statistics API Endpoint
 * GET /api/admin/dashboard
 * 
 * Returns statistics for the admin dashboard
 */

const { MongoClient } = require('mongodb');
const { checkAuth } = require('../_utils/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'users'; // Change to your collection name

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

    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate statistics in parallel
        const [
            totalRegistrations,
            todayRegistrations,
            emailsSent,
            pendingEmails
        ] = await Promise.all([
            // Total registrations
            collection.countDocuments({}),
            
            // Registrations today
            collection.countDocuments({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            }),
            
            // Emails sent (assuming emailSent field is true)
            collection.countDocuments({ emailSent: true }),
            
            // Pending emails (emailSent is false or doesn't exist)
            collection.countDocuments({ 
                $or: [
                    { emailSent: false },
                    { emailSent: { $exists: false } }
                ]
            })
        ]);

        return res.status(200).json({
            totalRegistrations,
            todayRegistrations,
            emailsSent,
            pendingEmails
        });

    } catch (error) {
        console.error('Dashboard API error:', error);
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

