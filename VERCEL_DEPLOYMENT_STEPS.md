# Vercel Deployment - Step by Step Guide

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub repository: `https://github.com/vipin4332/C_Penal`
- ✅ MongoDB Atlas account with connection string
- ✅ Vercel account (create at https://vercel.com if needed)

---

## Step 1: Create/Login to Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"** (if new) or **"Log In"** (if existing)
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Your Project

1. After logging in, you'll see the Vercel Dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **"C_Penal"** in the list
6. Click **"Import"** next to it

---

## Step 3: Configure Project Settings

### 3.1 Project Name
- **Project Name**: `c-penal` (or keep default)
- **Framework Preset**: Leave as **"Other"** or **"No Framework"**

### 3.2 Root Directory
- **IMPORTANT**: Leave **Root Directory** field **EMPTY** (blank)
- Do NOT set it to `backend` or `api`
- The root should be `/` (repository root)

### 3.3 Build Settings
- **Build Command**: Leave **EMPTY** (blank)
- **Output Directory**: Leave **EMPTY** (blank)
- **Install Command**: `npm install` (default)

---

## Step 4: Set Environment Variables

**CRITICAL**: Set these before deploying!

1. In the project configuration page, scroll to **"Environment Variables"** section
2. Click **"Add"** for each variable below:

### Required Variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | Your MongoDB connection string |
| `DB_NAME` | `Admin_Penal` | Your database name |
| `COLLECTION_NAME` | `users` | Collection for user registrations |
| `ADMIN_COLLECTION` | `admins` | Collection for admin users |

### Optional Variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `ADMIN_EMAIL` | `admin@example.com` | Legacy admin email (optional) |
| `ADMIN_PASSWORD` | `admin123` | Legacy admin password (optional) |
| `NODE_ENV` | `production` | Environment (optional) |

### How to Add Each Variable:

1. Click **"Add"** button
2. Enter **Variable Name** (e.g., `MONGODB_URI`)
3. Enter **Value** (your actual connection string)
4. Select **Environment**: Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**
6. Repeat for all variables

**Example MongoDB URI Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Admin_Penal?retryWrites=true&w=majority
```

---

## Step 5: Deploy

1. After setting all environment variables, scroll to bottom
2. Click **"Deploy"** button
3. Wait 2-3 minutes for deployment to complete
4. You'll see build logs in real-time

---

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

1. After deployment completes, you'll see:
   - ✅ **"Ready"** status (green)
   - Your deployment URL: `https://c-penal-xxxxx.vercel.app`

### 6.2 Test the API

1. Open a new browser tab
2. Visit: `https://c-penal-xxxxx.vercel.app/api/test`
3. You should see JSON response:
   ```json
   {
     "success": true,
     "message": "Backend API is working!",
     "timestamp": "...",
     "environment": {
       "nodeVersion": "v24.x.x",
       "hasMongoUri": true,
       "dbName": "Admin_Penal",
       ...
     }
   }
   ```

### 6.3 Check Functions

1. In Vercel dashboard, click on your deployment
2. Click **"Functions"** tab
3. You should see:
   - `/api/admin.js`
   - `/api/auth.js`
   - `/api/test.js`

---

## Step 7: Update Frontend Configuration

1. Go to your GitHub repository
2. Edit file: `frontend/admin/js/config.js`
3. Update `BACKEND_URL` to your Vercel URL:
   ```javascript
   const BACKEND_URL = 'https://c-penal-xxxxx.vercel.app';
   ```
4. Commit and push changes

---

## Step 8: Set Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

---

## Troubleshooting

### Issue: "No Output Directory" Error

**Solution:**
- Ensure **Root Directory** is **EMPTY**
- Ensure **Output Directory** is **EMPTY**
- Ensure **Build Command** is **EMPTY**

### Issue: "Function Runtimes" Error

**Solution:**
- Check `vercel.json` exists at root
- Check `package.json` has `engines` field
- Redeploy

### Issue: 404 on API Endpoints

**Solution:**
1. Check **Root Directory** is empty
2. Check **Functions** tab shows your API files
3. Verify `vercel.json` routes are correct
4. Check deployment logs for errors

### Issue: Database Connection Error

**Solution:**
1. Verify `MONGODB_URI` is set correctly
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Verify database name matches `DB_NAME` variable
4. Test connection string locally

### Issue: Environment Variables Not Working

**Solution:**
1. Ensure variables are set for **all environments** (Production, Preview, Development)
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

---

## Quick Reference

### Your Project URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project URL**: `https://c-penal-xxxxx.vercel.app` (check your dashboard)
- **Test Endpoint**: `https://c-penal-xxxxx.vercel.app/api/test`
- **Login Endpoint**: `https://c-penal-xxxxx.vercel.app/api/admin/login`

### Important Files

- `vercel.json` - Vercel configuration (at root)
- `package.json` - Dependencies and Node version
- `api/` - All serverless functions
- `frontend/admin/js/config.js` - Frontend API URL

### Environment Variables Checklist

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `DB_NAME` - Database name
- [ ] `COLLECTION_NAME` - Users collection
- [ ] `ADMIN_COLLECTION` - Admins collection
- [ ] `ADMIN_EMAIL` - (Optional) Legacy admin email
- [ ] `ADMIN_PASSWORD` - (Optional) Legacy admin password

---

## Next Steps After Deployment

1. ✅ Test `/api/test` endpoint
2. ✅ Update frontend `config.js` with Vercel URL
3. ✅ Test login from frontend
4. ✅ Verify all API endpoints work
5. ✅ Monitor Vercel dashboard for errors

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test API endpoints directly in browser

---

**Last Updated**: December 2025

