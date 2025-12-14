/**
 * States List API Endpoint
 * GET /api/admin/states
 * 
 * Returns list of unique states from user registrations
 * Used for populating the state filter dropdown
 */

const { MongoClient } = require('mongodb');
const { checkAuth } = require('../_utils/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'users';

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

        // Get distinct states
        const states = await collection.distinct('state');

        // Filter out null/undefined/empty values and sort
        const filteredStates = states
            .filter(state => state && state.trim() !== '')
            .sort();

        return res.status(200).json({
            states: filteredStates
        });

    } catch (error) {
        console.error('States API error:', error);
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

