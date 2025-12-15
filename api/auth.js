/**
 * Authentication & Admin Management API
 * Consolidates: login, signup, pending-users, approve-user, reject-user
 * Routes based on query parameter 'action' or path
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { generateSimpleToken, checkAuth, isSuperAdmin } = require('./_utils/auth');
const { addCorsHeaders } = require('./_utils/cors');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION || 'admins';

// Legacy admin credentials
const LEGACY_ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

module.exports = async (req, res) => {
    addCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Determine action from URL path - check multiple sources
    const url = req.url || '';
    const originalUrl = req.headers['x-vercel-original-path'] || req.headers['x-invoke-path'] || url;
    const pathname = originalUrl.split('?')[0]; // Remove query string
    
    let action = 'login'; // default
    
    if (pathname.includes('/signup') || url.includes('/signup')) {
        action = 'signup';
    } else if (pathname.includes('/pending-users') || url.includes('/pending-users')) {
        action = 'pending-users';
    } else if (pathname.includes('/approve-user') || url.includes('/approve-user')) {
        action = 'approve-user';
    } else if (pathname.includes('/reject-user') || url.includes('/reject-user')) {
        action = 'reject-user';
    } else if (pathname.includes('/login') || url.includes('/login')) {
        action = 'login';
    }

    // Route to appropriate handler
    switch (action) {
        case 'login':
            return handleLogin(req, res);
        case 'signup':
            return handleSignup(req, res);
        case 'pending-users':
            return handlePendingUsers(req, res);
        case 'approve-user':
            return handleApproveUser(req, res);
        case 'reject-user':
            return handleRejectUser(req, res);
        default:
            return res.status(404).json({ message: 'Endpoint not found' });
    }
};

// Login handler
async function handleLogin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check legacy admin
        if (email === LEGACY_ADMIN.email && password === LEGACY_ADMIN.password) {
            const token = generateSimpleToken(email, 'super_admin');
            return res.status(200).json({
                success: true,
                token: token,
                role: 'super_admin',
                message: 'Login successful'
            });
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        const user = await collection.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.approved !== true) {
            return res.status(403).json({
                error: 'Account pending approval',
                message: 'Your account is pending approval. Please wait for administrator approval.'
            });
        }

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
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (client) await client.close();
    }
}

// Signup handler
async function handleSignup(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'admin',
            approved: false,
            approvedAt: null,
            createdAt: new Date(),
            createdBy: 'self_signup'
        };

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
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    } finally {
        if (client) await client.close();
    }
}

// Pending users handler
async function handlePendingUsers(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const authResult = checkAuth(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isSuperAdmin(req)) {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        const pendingUsers = await collection
            .find({ approved: { $ne: true } })
            .sort({ createdAt: -1 })
            .toArray();

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
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.close();
    }
}

// Approve user handler
async function handleApproveUser(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const authResult = checkAuth(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isSuperAdmin(req)) {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }

    let client;
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        const superAdminEmail = authResult.email;
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
            return res.status(404).json({ message: 'User not found' });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ message: 'User may already be approved' });
        }

        return res.status(200).json({
            success: true,
            message: 'User approved successfully'
        });
    } catch (error) {
        console.error('Approve user API error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.close();
    }
}

// Reject user handler
async function handleRejectUser(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const authResult = checkAuth(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isSuperAdmin(req)) {
        return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }

    let client;
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(ADMIN_COLLECTION);

        let deleteResult;
        try {
            deleteResult = await collection.deleteOne({ _id: new ObjectId(userId) });
        } catch (error) {
            deleteResult = await collection.deleteOne({ _id: userId });
        }

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'User request rejected and removed'
        });
    } catch (error) {
        console.error('Reject user API error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (client) await client.close();
    }
}

