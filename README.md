# Admin Control Panel - Technical Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Backend API Documentation](#backend-api-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Environment Variables](#environment-variables)
9. [Database Schema](#database-schema)
10. [Authentication & Authorization](#authentication--authorization)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Development Guide](#development-guide)

---

## 🎯 Project Overview

**Admin Control Panel** is a full-stack web application for managing user registrations. It consists of:

- **Frontend**: Static HTML/CSS/JavaScript hosted on GitHub Pages
  - Entry Point: `frontend/admin/index.html`
- **Backend**: Node.js serverless functions hosted on Vercel
- **Database**: MongoDB (Atlas)

### Key Features

- Admin authentication with approval-based signup
- User registration management
- Dashboard with statistics
- User search and filtering
- Admit card download
- Role-based access control (admin, super_admin)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  GitHub Pages   │         │  Vercel Serverless│        │   MongoDB Atlas │
│   (Frontend)    │ ──────> │   (Backend API)  │ ──────> │   (Database)    │
│                 │  HTTPS  │                 │  HTTPS  │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js 18.x – 24.x (Vercel default: 24.x), Serverless Functions
- **Database**: MongoDB 8.0+ (Atlas)
- **Authentication**: Custom token-based (Base64 encoded)
- **Password Hashing**: bcryptjs
- **Hosting**: 
  - Frontend: GitHub Pages
  - Backend: Vercel

---

## 📁 Project Structure

```
C_Penal/
├── api/                          # Backend Serverless Functions
│   ├── _utils/                   # Shared utilities
│   │   ├── auth.js              # Authentication utilities
│   │   └── cors.js              # CORS configuration
│   ├── admin.js                 # Admin data endpoints (consolidated)
│   ├── auth.js                  # Authentication endpoints (consolidated)
│   └── test.js                  # Test endpoint
│
├── frontend/                     # Frontend Application
│   ├── admin/                   # Admin Panel
│   │   ├── css/
│   │   │   └── style.css       # Main stylesheet
│   │   ├── js/
│   │   │   ├── auth.js         # Frontend auth utilities
│   │   │   ├── config.js       # API configuration
│   │   │   ├── dashboard.js    # Dashboard logic
│   │   │   ├── users.js        # User list logic
│   │   │   ├── user-detail.js  # User detail logic
│   │   │   └── approvals.js    # Admin approval logic
│   │   ├── index.html          # Login page (Frontend entry point)
│   │   ├── signup.html         # Signup page
│   │   ├── dashboard.html      # Dashboard page
│   │   ├── users.html          # User list page
│   │   ├── user-detail.html    # User detail page
│   │   └── approvals.html      # Admin approvals page
│
├── vercel.json                  # Vercel deployment configuration
├── package.json                 # Node.js dependencies
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 🔧 Backend API Documentation

### File: `api/auth.js`

**Purpose**: Consolidated authentication and admin management endpoints

**Exports**: `module.exports = async (req, res) => { ... }`

**Routes Handled**:
- `/api/admin/login` - POST
- `/api/admin/signup` - POST
- `/api/admin/pending-users` - GET
- `/api/admin/approve-user` - POST
- `/api/admin/reject-user` - POST

**Functions**:

#### `handleLogin(req, res)`
- **Method**: POST
- **Body**: `{ email: string, password: string }`
- **Response**: `{ success: boolean, token: string, role: string, message: string }`
- **Description**: Authenticates admin users. Checks legacy admin credentials first, then MongoDB. Only approved users can login.

#### `handleSignup(req, res)`
- **Method**: POST
- **Body**: `{ name: string, email: string, password: string }`
- **Response**: `{ success: boolean, message: string }`
- **Description**: Creates new admin account with `approved: false`. Password is hashed using bcryptjs.

#### `handlePendingUsers(req, res)`
- **Method**: GET
- **Auth**: Required (Super Admin only)
- **Response**: `{ users: Array, count: number }`
- **Description**: Returns list of admin users waiting for approval.

#### `handleApproveUser(req, res)`
- **Method**: POST
- **Auth**: Required (Super Admin only)
- **Body**: `{ userId: string }`
- **Response**: `{ success: boolean, message: string }`
- **Description**: Approves a pending admin user. Sets `approved: true` and `approvedAt` timestamp.

#### `handleRejectUser(req, res)`
- **Method**: POST
- **Auth**: Required (Super Admin only)
- **Body**: `{ userId: string }`
- **Response**: `{ success: boolean, message: string }`
- **Description**: Deletes a pending admin user from database.

**Dependencies**:
- `mongodb` - Database connection
- `bcryptjs` - Password hashing
- `./_utils/auth` - Authentication utilities
- `./_utils/cors` - CORS headers

---

### File: `api/admin.js`

**Purpose**: Consolidated admin data endpoints

**Exports**: `module.exports = async (req, res) => { ... }`

**Routes Handled**:
- `/api/admin/dashboard` - GET
- `/api/admin/users` - GET
- `/api/admin/user/:id` - GET
- `/api/admin/states` - GET

**Functions**:

#### `handleDashboard(req, res)`
- **Method**: GET
- **Auth**: Required
- **Response**: `{ totalRegistrations: number, todayRegistrations: number, emailsSent: number, pendingEmails: number }`
- **Description**: Returns dashboard statistics.

#### `handleUsers(req, res)`
- **Method**: GET
- **Auth**: Required
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string) - Searches email, rollNumber, mobile, name
  - `state` (string) - Filter by state
  - `status` (string) - 'sent' or 'pending'
  - `dateFrom` (string) - Start date
  - `dateTo` (string) - End date
- **Response**: `{ users: Array, total: number, page: number, limit: number, totalPages: number }`
- **Description**: Returns paginated list of users with optional filters.

#### `handleUserDetail(req, res)`
- **Method**: GET
- **Auth**: Required
- **URL Parameter**: `id` (user ID)
- **Response**: User object with all details
- **Description**: Returns detailed information about a specific user.

#### `handleStates(req, res)`
- **Method**: GET
- **Auth**: Required
- **Response**: `{ states: Array<string> }`
- **Description**: Returns list of unique states from user registrations.

**Helper Functions**:

#### `buildFilter(query)`
- **Parameters**: `query` (object) - Request query parameters
- **Returns**: MongoDB filter object
- **Description**: Builds MongoDB filter from query parameters for search, state, status, and date range.

**Dependencies**:
- `mongodb` - Database connection
- `./_utils/auth` - Authentication utilities
- `./_utils/cors` - CORS headers

---

### File: `api/test.js`

**Purpose**: Test endpoint to verify deployment

**Exports**: `module.exports = async (req, res) => { ... }`

**Route**: `/api/test` - GET

**Response**: 
```json
{
  "success": true,
  "message": "Backend API is working!",
  "timestamp": "ISO string",
  "environment": {
    "hasMongoUri": boolean,
    "dbName": string,
    "nodeEnv": string
  }
}
```

---

### File: `api/_utils/auth.js`

**Purpose**: Shared authentication utilities

**Exports**:
- `checkAuth(req)` - Verify authentication token
- `generateSimpleToken(email, role)` - Generate auth token
- `isSuperAdmin(req)` - Check if user is super admin

#### `checkAuth(req)`
- **Parameters**: `req` - Express request object
- **Returns**: `{ authenticated: boolean, email?: string, role?: string }`
- **Description**: 
  - Extracts Bearer token from Authorization header
  - Decodes Base64 token
  - Validates token age (24 hours max)
  - Returns authentication status and user info

#### `generateSimpleToken(email, role)`
- **Parameters**: 
  - `email` (string) - User email
  - `role` (string, default: 'admin') - User role
- **Returns**: Base64 encoded token string
- **Description**: Creates a simple token with email, timestamp, and role. **Note**: For production, replace with JWT.

#### `isSuperAdmin(req)`
- **Parameters**: `req` - Express request object
- **Returns**: `boolean`
- **Description**: Checks if authenticated user has super_admin role.

---

### File: `api/_utils/cors.js`

**Purpose**: CORS configuration

**Exports**:
- `addCorsHeaders(res)` - Add CORS headers to response
- `handleOptions(req, res)` - Handle OPTIONS preflight requests

#### `addCorsHeaders(res)`
- **Parameters**: `res` - Express response object
- **Description**: Adds CORS headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`
  - `Access-Control-Max-Age: 86400`

---

## 🎨 Frontend Documentation

### File: `frontend/admin/js/config.js`

**Purpose**: API configuration

**Variables**:
- `BACKEND_URL` (string) - Vercel backend URL: `'https://c-penal.vercel.app'`

**Functions**:

#### `getApiUrl(endpoint)`
- **Parameters**: `endpoint` (string) - API endpoint path
- **Returns**: Full API URL string
- **Description**: Constructs full API URL by prepending BACKEND_URL to endpoint.

---

### File: `frontend/admin/js/auth.js`

**Purpose**: Frontend authentication utilities

**Functions**:

#### `checkAuth()`
- **Returns**: `boolean`
- **Description**: Checks if user is authenticated. Redirects to login if not.

#### `logout()`
- **Description**: Clears session storage and redirects to login.

#### `getAuthToken()`
- **Returns**: `string | null` - Auth token from sessionStorage

#### `getAdminEmail()`
- **Returns**: `string | null` - Admin email from sessionStorage

#### `getAdminRole()`
- **Returns**: `string` - Admin role (default: 'admin')

#### `isSuperAdmin()`
- **Returns**: `boolean` - True if user is super admin

#### `setAdminEmailInNav()`
- **Description**: Updates navigation bar with admin email and shows/hides "Admin Requests" link based on role.

#### `authenticatedFetch(url, options)`
- **Parameters**:
  - `url` (string) - API endpoint
  - `options` (object, optional) - Fetch options
- **Returns**: `Promise<Response>`
- **Description**: 
  - Adds Authorization header with Bearer token
  - Uses `getApiUrl()` for full URL
  - Handles 401 responses by redirecting to login
  - Returns fetch response

---

### File: `frontend/admin/js/dashboard.js`

**Purpose**: Dashboard page logic

**Functions**:

#### `loadDashboard()`
- **Description**: 
  - Fetches dashboard statistics from `/api/admin/dashboard`
  - Updates DOM with statistics
  - Handles errors

**Event Listeners**:
- Page load: Calls `loadDashboard()`

---

### File: `frontend/admin/js/users.js`

**Purpose**: User list page logic

**Variables**:
- `currentPage` (number) - Current page number
- `currentFilters` (object) - Active filters

**Functions**:

#### `loadUsers(page, filters)`
- **Parameters**:
  - `page` (number) - Page number
  - `filters` (object) - Filter options
- **Description**: 
  - Fetches users from `/api/admin/users` with pagination and filters
  - Renders user table
  - Updates pagination controls

#### `applyFilters()`
- **Description**: Collects filter values from form and reloads users.

#### `clearFilters()`
- **Description**: Resets all filters and reloads users.

#### `searchUsers()`
- **Description**: Handles search input and applies search filter.

#### `loadStates()`
- **Description**: Fetches states from `/api/admin/states` and populates state filter dropdown.

**Event Listeners**:
- Search input: Debounced search
- Filter form: Apply filters on change
- Clear filters button: Reset filters
- Pagination buttons: Navigate pages

---

### File: `frontend/admin/js/user-detail.js`

**Purpose**: User detail page logic

**Functions**:

#### `loadUserDetails(userId)`
- **Parameters**: `userId` (string) - User ID from URL
- **Description**: 
  - Fetches user details from `/api/admin/user/:id`
  - Renders user information in sections
  - Handles errors

#### `downloadAdmitCard()`
- **Description**: Opens/downloads PDF from `user.pdfUrl` if available.

**Event Listeners**:
- Page load: Extracts userId from URL and loads details
- Download button: Downloads admit card

---

### File: `frontend/admin/js/approvals.js`

**Purpose**: Admin approval page logic (Super Admin only)

**Functions**:

#### `loadPendingUsers()`
- **Description**: 
  - Fetches pending users from `/api/admin/pending-users`
  - Renders approval table
  - Handles errors

#### `approveUser(userId)`
- **Parameters**: `userId` (string) - User ID to approve
- **Description**: 
  - Sends approval request to `/api/admin/approve-user`
  - Reloads pending users list
  - Shows success/error message

#### `rejectUser(userId)`
- **Parameters**: `userId` (string) - User ID to reject
- **Description**: 
  - Sends rejection request to `/api/admin/reject-user`
  - Reloads pending users list
  - Shows success/error message

**Event Listeners**:
- Page load: Loads pending users
- Approve buttons: Approve user
- Reject buttons: Reject user

---

## ⚙️ Configuration

### File: `vercel.json`

**Purpose**: Vercel deployment configuration

**Structure**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/admin/login",
      "dest": "/api/auth.js"
    },
    // ... more routes
  ]
}
```

**Routes**:
- All `/api/admin/*` routes map to consolidated files
- `/api/test` maps to `api/test.js`

---

### File: `package.json`

**Dependencies**:
- `mongodb` (^6.10.0) - MongoDB driver (compatible with MongoDB 8.0+)
- `bcryptjs` (^2.4.3) - Password hashing

**Dev Dependencies**:
- `vercel` (^32.0.0) - Vercel CLI

**Scripts**:
- `dev` - Run Vercel dev server
- `build` - No-op (echo)
- `start` - Run Vercel dev server

---

## 🚀 Deployment

### Backend (Vercel)

1. **Prerequisites**:
   - Vercel account
   - GitHub repository connected

2. **Environment Variables** (Set in Vercel Dashboard):
   - `MONGODB_URI` - MongoDB connection string
   - `DB_NAME` - Database name
   - `COLLECTION_NAME` - Users collection name
   - `ADMIN_COLLECTION` - Admins collection name
   - `ADMIN_EMAIL` - Legacy admin email (optional)
   - `ADMIN_PASSWORD` - Legacy admin password (optional)

3. **Deployment**:
   - Push to `main` branch triggers auto-deployment
   - Vercel detects `vercel.json` and deploys serverless functions
   - Root Directory: `/` (empty/root)

4. **Verify**:
   - Test: `https://c-penal.vercel.app/api/test`
   - Check Functions tab in Vercel dashboard

### Frontend (GitHub Pages)

**Frontend Entry Point**: `frontend/admin/index.html`

1. **Prerequisites**:
   - GitHub repository
   - GitHub Pages enabled

2. **Configuration**:
   - Source: `main` branch
   - Folder: `/` (root)
   - Custom domain: Optional

3. **Update Backend URL**:
   - Edit `frontend/admin/js/config.js`
   - Update `BACKEND_URL` to your Vercel URL

4. **Access**:
   - `https://vipin4332.github.io/C_Penal/frontend/admin/index.html`
   - Or: `https://vipin4332.github.io/C_Penal/frontend/admin/` (GitHub Pages will serve index.html automatically)

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `Admin_Penal` |
| `COLLECTION_NAME` | Users collection name | `users` |
| `ADMIN_COLLECTION` | Admins collection name | `admins` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Legacy admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Legacy admin password | `admin123` |
| `NODE_ENV` | Environment | `production` |

---

## 🗄️ Database Schema

### Collection: `users`

**Purpose**: User registrations

**Schema**:
```javascript
{
  _id: ObjectId,
  name: string,                    // or fullName, full_name
  email: string,
  mobile: string,                  // or phone, mobileNumber
  rollNumber: string,              // or roll_number
  state: string,
  city: string,
  address: string,                 // or fullAddress
  pincode: string,                 // or pinCode
  dateOfBirth: Date,               // or dob, date_of_birth
  gender: string,
  qualification: string,           // or education, degree
  institution: string,             // or college, school
  yearOfPassing: number,           // or passingYear
  createdAt: Date,                 // or created_at, submissionDate
  emailSent: boolean,              // or email_sent
  pdfUrl: string,                  // or pdf_url, admitCardUrl
  // ... other fields
}
```

### Collection: `admins`

**Purpose**: Admin users

**Schema**:
```javascript
{
  _id: ObjectId,
  name: string,
  email: string,                   // unique, lowercase
  password: string,                // bcrypt hashed
  role: string,                    // 'admin' or 'super_admin'
  approved: boolean,               // false until approved
  approvedAt: Date,                // null until approved
  approvedBy: string,              // email of super admin who approved
  createdAt: Date,
  createdBy: string                // 'self_signup' or admin email
}
```

---

## 🔒 Authentication & Authorization

### Authentication Flow

1. **Login**:
   - User submits email/password
   - Backend checks credentials
   - If approved, returns token
   - Frontend stores token in sessionStorage

2. **Token Structure**:
   ```javascript
   {
     email: string,
     timestamp: number,
     role: string
   }
   ```
   - Encoded as Base64
   - Valid for 24 hours

3. **API Requests**:
   - Frontend adds `Authorization: Bearer <token>` header
   - Backend validates token
   - Returns 401 if invalid/expired

### Authorization

- **Admin**: Can access dashboard, users, user details
- **Super Admin**: All admin permissions + approve/reject admin requests

### Role Check

```javascript
// Backend
const authResult = checkAuth(req);
if (!authResult.authenticated) {
  return res.status(401).json({ message: 'Unauthorized' });
}

if (!isSuperAdmin(req)) {
  return res.status(403).json({ message: 'Access denied' });
}
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | No | Login admin user |
| POST | `/api/admin/signup` | No | Request admin access |
| GET | `/api/admin/pending-users` | Super Admin | List pending admin requests |
| POST | `/api/admin/approve-user` | Super Admin | Approve admin user |
| POST | `/api/admin/reject-user` | Super Admin | Reject admin user |

### Data Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | Required | Dashboard statistics |
| GET | `/api/admin/users` | Required | List users (paginated, filtered) |
| GET | `/api/admin/user/:id` | Required | User details |
| GET | `/api/admin/states` | Required | List unique states |

### Utility Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/test` | No | Test endpoint |

---

## 💻 Development Guide

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/vipin4332/C_Penal.git
   cd C_Penal
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create `.env.local`:
   ```
   MONGODB_URI=your_connection_string
   DB_NAME=your_database
   COLLECTION_NAME=users
   ADMIN_COLLECTION=admins
   ```

4. **Run Vercel Dev**:
   ```bash
   npm run dev
   ```

5. **Test Frontend**:
   - Open `frontend/admin/index.html` in browser
   - Update `config.js` to use `http://localhost:3000` for local testing

### Code Style

- **Backend**: CommonJS modules (`module.exports`)
- **Frontend**: ES6+ JavaScript
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: JSDoc-style comments for functions

### Adding New Endpoints

1. **Add to consolidated file** (`auth.js` or `admin.js`)
2. **Add route handler function**
3. **Update route detection logic**
4. **Add route to `vercel.json`** (if needed)
5. **Update frontend** to call new endpoint

### Adding New Fields

1. **Update database schema** (documentation)
2. **Update API response formatting**
3. **Update frontend display logic**
4. **Update search/filter logic** (if needed)

---

## 🐛 Troubleshooting

### Common Issues

1. **404 Errors**:
   - Check `vercel.json` routes
   - Verify file paths
   - Check Vercel deployment logs

2. **CORS Errors**:
   - Verify `addCorsHeaders()` is called
   - Check `BACKEND_URL` in `config.js`

3. **Authentication Errors**:
   - Check token in sessionStorage
   - Verify token format
   - Check token expiration (24 hours)

4. **Database Connection Errors**:
   - Verify `MONGODB_URI` in Vercel
   - Check network access
   - Verify database name

5. **Function Count Limit**:
   - Current: 3 functions (under 12 limit)
   - If adding more, consolidate into existing files

---

## 📝 Notes

- **Token Security**: Current implementation uses Base64 encoding. For production, migrate to JWT.
- **Password Hashing**: Uses bcryptjs with 10 salt rounds.
- **CORS**: Currently allows all origins (`*`). Restrict in production.
- **Error Handling**: All endpoints return consistent error format.
- **Pagination**: Default 20 items per page, configurable via query parameter.

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review Vercel deployment logs
3. Check browser console for frontend errors
4. Verify environment variables

---

## 📄 License

MIT License

---

**Last Updated**: December 2025
**Version**: 1.0.0

