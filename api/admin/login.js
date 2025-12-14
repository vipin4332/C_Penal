/**
 * Admin Login API Endpoint
 * POST /api/admin/login
 * 
 * Simple authentication for admin users
 * TODO: Improve security with JWT tokens, password hashing, etc.
 */

const { generateSimpleToken } = require('../_utils/auth');

// Simple admin credentials (TODO: Move to database or environment variables)
// In production, use proper authentication with hashed passwords
const ADMIN_CREDENTIALS = {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123' // Change this!
};

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Simple authentication check
        // TODO: Implement proper authentication with database lookup
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            // Generate simple token (in production, use JWT)
            const token = generateSimpleToken(email);
            
            return res.status(200).json({
                success: true,
                token: token,
                message: 'Login successful'
            });
        } else {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

