# Admin Control Panel

A simple, non-technical-friendly admin control panel for managing user registrations.

## 📋 Features

- **Admin Login** - Secure authentication for admin access
- **Dashboard** - Overview statistics and data flow explanation
- **User Management** - View all registered users with search and filters
- **User Details** - Detailed view of individual user information
- **Admit Card Download** - Download user admit cards
- **Mobile Friendly** - Responsive design for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- MongoDB database
- Vercel account (for deployment)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**

   Create a `.env` file or set these in Vercel:
   ```
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=your_database_name
   COLLECTION_NAME=users
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   - Open `http://localhost:3000/admin/` in your browser
   - Login with your admin credentials

## 📁 Project Structure

```
C_Penal/
├── admin/                    # Frontend files
│   ├── index.html           # Login page
│   ├── dashboard.html       # Dashboard page
│   ├── users.html           # User list page
│   ├── user-detail.html     # User detail page
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   └── js/
│       ├── auth.js          # Authentication utilities
│       ├── dashboard.js     # Dashboard logic
│       ├── users.js         # User list logic
│       └── user-detail.js   # User detail logic
├── api/                     # Backend API endpoints
│   └── admin/
│       ├── login.js         # Login endpoint
│       ├── dashboard.js     # Dashboard stats endpoint
│       ├── users.js         # Users list endpoint
│       ├── user/[id].js     # User detail endpoint
│       └── states.js        # States list endpoint
├── package.json
├── vercel.json              # Vercel configuration
└── README.md
```

## 🔐 Security Notes

⚠️ **IMPORTANT**: The current authentication is simplified for quick setup. For production:

1. **Use JWT tokens** instead of base64 encoding
2. **Hash passwords** using bcrypt
3. **Store admin credentials** in database, not code
4. **Add rate limiting** to prevent brute force attacks
5. **Use HTTPS** for all connections
6. **Implement proper session management**

## 🎨 Customization

### Changing UI Text

All user-facing text is in the HTML files. Search for labels and update them directly.

### Adding New Fields

1. **Backend**: Update the API endpoints to include new fields
2. **Frontend**: Add new fields to the user detail page HTML
3. **JavaScript**: Update the `populateUserDetails()` function in `user-detail.js`

### Changing Colors

Edit the CSS variables in `admin/css/style.css`:
```css
:root {
    --primary-color: #2563eb;  /* Change this */
    --secondary-color: #64748b;
    /* ... */
}
```

## 📝 API Endpoints

### POST `/api/admin/login`
Admin login endpoint.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "base64_encoded_token",
  "message": "Login successful"
}
```

### GET `/api/admin/dashboard`
Get dashboard statistics.

**Response:**
```json
{
  "totalRegistrations": 100,
  "todayRegistrations": 5,
  "emailsSent": 80,
  "pendingEmails": 20
}
```

### GET `/api/admin/users`
Get paginated list of users.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `state` - Filter by state
- `status` - Filter by status (sent/pending)
- `dateFrom` - Filter from date
- `dateTo` - Filter to date

### GET `/api/admin/user/:id`
Get detailed user information.

### GET `/api/admin/states`
Get list of unique states.

## 🔧 Database Schema

The system expects users to have these fields (flexible naming):

- `name` / `fullName` / `full_name`
- `email`
- `mobile` / `phone` / `mobileNumber`
- `rollNumber` / `roll_number`
- `state`
- `city`
- `pincode` / `pinCode`
- `createdAt` / `created_at` / `submissionDate`
- `emailSent` / `email_sent` (boolean)
- `pdfUrl` / `pdf_url` / `admitCardUrl`

## 🚀 Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all required environment variables

4. **Access Your Admin Panel**
   - Your admin panel will be available at `https://your-project.vercel.app/admin/`

## 📱 Usage Guide for Non-Technical Users

### Logging In
1. Go to the admin panel URL
2. Enter your email and password
3. Click "Login"

### Viewing Dashboard
- See total registrations
- Check today's registrations
- View email statistics
- Understand the data flow process

### Managing Users
1. Click "All Users" in navigation
2. Use search box to find specific users
3. Use filters to narrow down results
4. Click "View" to see user details
5. Click "Download" to get admit cards

### Viewing User Details
- See all user information organized in sections
- Download admit card if available
- Check email status

## 🛠️ Future Enhancements

The code is structured to easily add:
- Export to Excel functionality
- Edit user information
- Delete users
- Multiple admin accounts
- Role-based access control
- Email resending
- Bulk operations

## 📞 Support

For issues or questions, check the code comments - they explain each section clearly.

## 📄 License

MIT License - Feel free to modify and use as needed.

