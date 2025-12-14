/**
 * User Detail API Endpoint
 * GET /api/admin/user/:id
 * 
 * Returns detailed information about a specific user
 */

const { MongoClient, ObjectId } = require('mongodb');
const { checkAuth } = require('../../_utils/auth');

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

    // Get user ID from URL
    const userId = req.query.id || req.query.userId;
    
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Find user by ID
        let user;
        try {
            user = await collection.findOne({ _id: new ObjectId(userId) });
        } catch (error) {
            // If ObjectId conversion fails, try as string
            user = await collection.findOne({ _id: userId });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format user data for response
        // Map various possible field names to standard format
        const formattedUser = {
            _id: user._id.toString(),
            id: user._id.toString(),
            
            // Personal Details
            name: user.name || user.fullName || user.full_name || '-',
            rollNumber: user.rollNumber || user.roll_number || '-',
            dateOfBirth: user.dateOfBirth || user.dob || user.date_of_birth,
            dob: user.dateOfBirth || user.dob || user.date_of_birth,
            gender: user.gender || '-',
            
            // Contact Details
            email: user.email || '-',
            mobile: user.mobile || user.phone || user.mobileNumber || user.mobile_number || '-',
            phone: user.mobile || user.phone || user.mobileNumber || user.mobile_number || '-',
            address: user.address || user.fullAddress || user.full_address || '-',
            state: user.state || '-',
            city: user.city || '-',
            pincode: user.pincode || user.pinCode || user.pin_code || '-',
            pinCode: user.pincode || user.pinCode || user.pin_code || '-',
            
            // Education Details
            qualification: user.qualification || user.education || user.degree || '-',
            education: user.qualification || user.education || user.degree || '-',
            institution: user.institution || user.college || user.school || '-',
            college: user.institution || user.college || user.school || '-',
            yearOfPassing: user.yearOfPassing || user.passingYear || user.passing_year || '-',
            passingYear: user.yearOfPassing || user.passingYear || user.passing_year || '-',
            
            // Registration Information
            createdAt: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            registrationDate: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            submissionDate: user.createdAt || user.created_at || user.submissionDate || user.submission_date,
            
            // Email Status
            emailSent: user.emailSent || user.email_sent || false,
            
            // Admit Card
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
        if (client) {
            await client.close();
        }
    }
};

