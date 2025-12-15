/**
 * Admin Data API
 * Consolidates: dashboard, users, states, user detail
 * Routes based on URL path
 */

const { MongoClient, ObjectId } = require('mongodb');
const { checkAuth } = require('./_utils/auth');
const { addCorsHeaders } = require('./_utils/cors');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'users';

module.exports = async (req, res) => {
    addCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check authentication (except for test endpoints)
    const authResult = checkAuth(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Determine action from URL path
    const url = req.url || '';
    let action = 'dashboard'; // default
    
    if (url.includes('/users') && !url.includes('/user/')) {
        action = 'users';
    } else if (url.includes('/user/') || url.includes('/user?')) {
        action = 'user-detail';
    } else if (url.includes('/states')) {
        action = 'states';
    } else {
        action = 'dashboard';
    }

    // Route to appropriate handler
    switch (action) {
        case 'dashboard':
            return handleDashboard(req, res);
        case 'users':
            return handleUsers(req, res);
        case 'user-detail':
            return handleUserDetail(req, res);
        case 'states':
            return handleStates(req, res);
        default:
            return res.status(404).json({ message: 'Endpoint not found' });
    }
};

// Dashboard handler
async function handleDashboard(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalRegistrations,
            todayRegistrations,
            emailsSent,
            pendingEmails
        ] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            }),
            collection.countDocuments({ emailSent: true }),
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
        if (client) await client.close();
    }
}

// Users handler
async function handleUsers(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = buildFilter(req.query);

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const [total, users] = await Promise.all([
            collection.countDocuments(filter),
            collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray()
        ]);

        const totalPages = Math.ceil(total / limit);

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
        if (client) await client.close();
    }
}

// User detail handler
async function handleUserDetail(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Extract user ID from URL or query
    const url = req.url || '';
    let userId = req.query.id || req.query.userId;
    
    // Try to extract from URL path like /user/123
    if (!userId && url.includes('/user/')) {
        const match = url.match(/\/user\/([^/?]+)/);
        if (match) userId = match[1];
    }
    
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        let user;
        try {
            user = await collection.findOne({ _id: new ObjectId(userId) });
        } catch (error) {
            user = await collection.findOne({ _id: userId });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const formattedUser = {
            _id: user._id.toString(),
            id: user._id.toString(),
            name: user.name || user.fullName || user.full_name || '-',
            rollNumber: user.rollNumber || user.roll_number || '-',
            dateOfBirth: user.dateOfBirth || user.dob || user.date_of_birth,
            dob: user.dateOfBirth || user.dob || user.date_of_birth,
            gender: user.gender || '-',
            email: user.email || '-',
            mobile: user.mobile || user.phone || user.mobileNumber || user.mobile_number || '-',
            phone: user.mobile || user.phone || user.mobileNumber || user.mobile_number || '-',
            address: user.address || user.fullAddress || user.full_address || '-',
            state: user.state || '-',
            city: user.city || '-',
            pincode: user.pincode || user.pinCode || user.pin_code || '-',
            pinCode: user.pincode || user.pinCode || user.pin_code || '-',
            qualification: user.qualification || user.education || user.degree || '-',
            education: user.qualification || user.education || user.degree || '-',
            institution: user.institution || user.college || user.school || '-',
            college: user.institution || user.college || user.school || '-',
            yearOfPassing: user.yearOfPassing || user.passingYear || user.passing_year || '-',
            passingYear: user.yearOfPassing || user.passingYear || user.passing_year || '-',
            createdAt: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            registrationDate: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            submissionDate: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            emailSent: user.emailSent || user.email_sent || false,
            pdfUrl: user.pdfUrl || user.pdf_url || user.admitCardUrl || user.admit_card_url || null
        };

        return res.status(200).json(formattedUser);
    } catch (error) {
        console.error('User detail API error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    } finally {
        if (client) await client.close();
    }
}

// States handler
async function handleStates(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const states = await collection.distinct('state');
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
        if (client) await client.close();
    }
}

// Build filter helper
function buildFilter(query) {
    const filter = {};

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

    if (query.state) {
        filter.state = query.state;
    }

    if (query.status === 'sent') {
        filter.emailSent = true;
    } else if (query.status === 'pending') {
        filter.$or = [
            { emailSent: false },
            { emailSent: { $exists: false } }
        ];
    }

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

