# Setup Guide - Admin Control Panel

## 🚀 Quick Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Database Configuration
DB_NAME=your_database_name
COLLECTION_NAME=users

# Admin Login Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
```

**Important:** 
- Replace `your_database_name` with your actual MongoDB database name
- Replace `users` with your actual collection name if different
- Change the admin email and password to secure values
- Never commit the `.env` file to version control

### 3. Test Locally

```bash
npm run dev
```

Then open: `http://localhost:3000/admin/`

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy

### 5. Set Environment Variables in Vercel

After deployment, go to your Vercel project settings and add:

- `MONGODB_URI` - Your MongoDB connection string
- `DB_NAME` - Your database name
- `COLLECTION_NAME` - Your collection name (usually "users")
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password

## 📋 Database Schema Requirements

Your MongoDB collection should have documents with these fields (flexible naming supported):

### Required Fields:
- `email` - User email address
- `name` or `fullName` - User's full name
- `createdAt` or `created_at` - Registration timestamp

### Common Fields:
- `rollNumber` or `roll_number` - User's roll number
- `mobile` or `phone` - Mobile number
- `state` - State name
- `city` - City name
- `pincode` or `pinCode` - Pin code
- `emailSent` or `email_sent` - Boolean, whether email was sent
- `pdfUrl` or `pdf_url` - URL to admit card PDF

### Example Document:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "rollNumber": "ROLL001",
  "state": "Maharashtra",
  "city": "Mumbai",
  "pincode": "400001",
  "emailSent": true,
  "pdfUrl": "https://example.com/admit-cards/roll001.pdf",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🔧 Customization

### Change Admin Credentials

Update the environment variables:
- `ADMIN_EMAIL` - New admin email
- `ADMIN_PASSWORD` - New admin password

### Change Database/Collection Name

Update environment variables:
- `DB_NAME` - Your database name
- `COLLECTION_NAME` - Your collection name

### Modify UI Colors

Edit `admin/css/style.css` and change the CSS variables:

```css
:root {
    --primary-color: #2563eb;  /* Change this */
    --secondary-color: #64748b;
    /* ... */
}
```

### Add New Fields

1. **Backend**: Update API endpoints in `api/admin/` to include new fields
2. **Frontend**: Add fields to `admin/user-detail.html`
3. **JavaScript**: Update `populateUserDetails()` in `admin/js/user-detail.js`

## 🔐 Security Recommendations

⚠️ **For Production Use:**

1. **Use JWT Tokens**: Replace the simple base64 token with proper JWT
2. **Hash Passwords**: Use bcrypt to hash admin passwords
3. **Store Admin in Database**: Don't hardcode credentials
4. **Add Rate Limiting**: Prevent brute force attacks
5. **Use HTTPS**: Always use HTTPS in production
6. **Add CORS**: Configure CORS properly if needed
7. **Input Validation**: Add more validation on API endpoints

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check your `MONGODB_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas (if using Atlas)
- Check network connectivity

### "Unauthorized" errors
- Check if you're logged in
- Verify your token hasn't expired (24 hours)
- Try logging out and logging back in

### "User not found"
- Verify the user ID is correct
- Check if the collection name matches your `COLLECTION_NAME` env variable
- Ensure the user exists in the database

### Pages not loading
- Check browser console for errors
- Verify API endpoints are accessible
- Check Vercel deployment logs

## 📞 Need Help?

- Check the code comments - they explain each section
- Review the README.md for more details
- Check Vercel deployment logs for backend errors
- Check browser console for frontend errors

