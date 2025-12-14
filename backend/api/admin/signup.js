/**
 * Admin Signup API Endpoint
 * POST /api/admin/signup
 * 
 * Allows new admin users to request access
 * Account must be approved before login
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION || 'admins'; // Collection for admin users

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;

    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please enter a valid email address' 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        // Check if email already exists
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'An account with this email already exists' 
            });
        }

        // Hash password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new admin user
        const newAdmin = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'admin', // Default role
            approved: false, // Must be approved by super admin
            approvedAt: null,
            createdAt: new Date(),
            createdBy: 'self_signup'
        };

        // Insert into database
        const result = await collection.insertOne(newAdmin);

        if (result.insertedId) {
            return res.status(201).json({
                success: true,
                message: 'Your request has been sent for approval. You will be notified once your account is approved.'
            });
        } else {
            throw new Error('Failed to create account');
        }

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            message: 'Internal server error. Please try again later.'
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

