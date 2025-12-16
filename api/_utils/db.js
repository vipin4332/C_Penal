/**
 * MongoDB Connection Utility
 * Caches MongoClient globally to prevent connection storms in serverless
 */

const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

/**
 * Get MongoDB client (cached)
 * @returns {Promise<MongoClient>}
 */
async function getMongoClient() {
    if (cachedClient) {
        return cachedClient;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    // MongoDB 8.0+ compatible options (no deprecated options)
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
    
    return cachedClient;
}

/**
 * Get MongoDB database (cached)
 * @param {string} dbName - Database name
 * @returns {Promise<Db>}
 */
async function getDatabase(dbName) {
    if (!dbName) {
        throw new Error('Database name is required');
    }

    const client = await getMongoClient();
    if (cachedDb && cachedDb.databaseName === dbName) {
        return cachedDb;
    }

    cachedDb = client.db(dbName);
    return cachedDb;
}

/**
 * Close MongoDB connection (for cleanup if needed)
 */
async function closeConnection() {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
    }
}

module.exports = {
    getMongoClient,
    getDatabase,
    closeConnection
};

