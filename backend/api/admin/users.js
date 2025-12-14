/**
 * Users List API Endpoint
 * GET /api/admin/users
 * 
 * Returns paginated list of users with optional search and filters
 */

const { MongoClient, ObjectId } = require('mongodb');
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
        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter query
        const filter = buildFilter(req.query);

        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Get total count and users in parallel
        const [total, users] = await Promise.all([
            collection.countDocuments(filter),
            collection
                .find(filter)
                .sort({ createdAt: -1 }) // Latest first
                .skip(skip)
                .limit(limit)
                .toArray()
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        // Format users for response (only send necessary fields)
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            id: user._id.toString(),
            rollNumber: user.rollNumber || user.roll_number,
            name: user.name || user.fullName || user.full_name,
            email: user.email,
            mobile: user.mobile || user.phone || user.mobileNumber,
            state: user.state,
            createdAt: user.createdAt || user.created_at || user.submissionDate,
            submissionDate: user.createdAt || user.created_at || user.submissionDate,
            emailSent: user.emailSent || user.email_sent || false,
            pdfUrl: user.pdfUrl || user.pdf_url || user.admitCardUrl
        }));

        return res.status(200).json({
            users: formattedUsers,
            total,
            page,
            limit,
            totalPages
        });

    } catch (error) {
        console.error('Users API error:', error);
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

/**
 * Build MongoDB filter from query parameters
 */
function buildFilter(query) {
    const filter = {};

    // Search filter (searches in email, rollNumber, mobile, name)
    if (query.search) {
        const searchRegex = { $regex: query.search, $options: 'i' };
        filter.$or = [
            { email: searchRegex },
            { rollNumber: searchRegex },
            { roll_number: searchRegex },
            { mobile: searchRegex },
            { phone: searchRegex },
            { mobileNumber: searchRegex },
            { name: searchRegex },
            { fullName: searchRegex },
            { full_name: searchRegex }
        ];
    }

    // State filter
    if (query.state) {
        filter.state = query.state;
    }

    // Status filter (email sent/pending)
    if (query.status === 'sent') {
        filter.emailSent = true;
    } else if (query.status === 'pending') {
        filter.$or = [
            { emailSent: false },
            { emailSent: { $exists: false } }
        ];
    }

    // Date range filter
    if (query.dateFrom || query.dateTo) {
        filter.createdAt = {};
        
        if (query.dateFrom) {
            const fromDate = new Date(query.dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filter.createdAt.$gte = fromDate;
        }
        
        if (query.dateTo) {
            const toDate = new Date(query.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = toDate;
        }
    }

    return filter;
}

