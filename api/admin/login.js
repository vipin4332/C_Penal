/**
 * Admin Login API Endpoint
 * POST /api/admin/login
 * 
 * Authenticates admin users from database
 * Only approved users can login
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { generateSimpleToken } = require('../_utils/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION || 'admins';

// Legacy admin credentials (for backward compatibility)
// TODO: Create super_admin account in database and remove this
const LEGACY_ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Check legacy admin first (for backward compatibility)
        if (email === LEGACY_ADMIN.email && password === LEGACY_ADMIN.password) {
            const token = generateSimpleToken(email, 'super_admin');
            return res.status(200).json({
                success: true,
                token: token,
                role: 'super_admin',
                message: 'Login successful'
            });
        }

        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        // Find user by email
        const user = await collection.findOne({ email: email.toLowerCase().trim() });

        // If user not found
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check if user is approved
        if (user.approved !== true) {
            return res.status(403).json({
                error: 'Account pending approval',
                message: 'Your account is pending approval. Please wait for administrator approval.'
            });
        }

        // Generate token with user's role
        const role = user.role || 'admin';
        const token = generateSimpleToken(user.email, role);
        
        return res.status(200).json({
            success: true,
            token: token,
            role: role,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

