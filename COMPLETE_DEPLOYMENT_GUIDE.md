# 🚀 Complete Deployment Guide for HRAI (AIR-ecruiter)

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Critical Issues & Fixes](#critical-issues--fixes)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Backend Deployment (Render)](#backend-deployment-render)
6. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

### ✅ What This Application Is
- **HRAI** (AIR-ecruiter): AI-powered HR Intelligence Platform
- **Tech Stack**: React 19 + FastAPI + MongoDB + Groq AI (Llama 3.3-70B)
- **Features**: Resume screening, job description management, interview scheduling, email generation
- **Architecture**: Separate frontend (Vercel) and backend (Render) deployment

### ⚠️ Required Services & API Keys
Before deploying, you MUST have:

1. **MongoDB Atlas Account** (Database) - FREE tier available
2. **Groq AI API Key** (Required for core AI features) - FREE tier available
3. **Google OAuth Credentials** (Required for authentication)
4. **Vercel Account** (Frontend hosting) - FREE
5. **Render Account** (Backend hosting) - FREE tier available

---

## 🚨 Critical Issues & Fixes

### **ISSUE #1: Hardcoded Port in Backend** ❌ DEPLOYMENT BLOCKER
**Problem**: `backend/server.py` line 1686 has hardcoded port 8001
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Why Critical**: Render uses dynamic PORT environment variable. App will crash on startup.

**✅ FIX REQUIRED**:
Replace lines 1684-1686 in `backend/server.py` with:
```python
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### **ISSUE #2: Missing Environment Variable Files** ⚠️ WARNING
**Problem**: No `.env.example` files to guide deployment

**✅ FIX**: Created `.env.example` files (see Environment Variables section)

### **ISSUE #3: Frontend API Endpoint Configuration** ✅ ALREADY HANDLED
**Status**: Frontend correctly uses `/api` relative path with `REACT_APP_BACKEND_URL` fallback for OAuth
- `src/utils/api.js` uses `/api` for regular API calls
- `src/pages/AuthCallback.js` uses `process.env.REACT_APP_BACKEND_URL` for OAuth callback

### **ISSUE #4: CORS Configuration** ⚠️ NEEDS PRODUCTION SETUP
**Current**: Uses wildcard `*` in development
**Required**: Must set specific origins for production

### **ISSUE #5: Google OAuth Redirect URI** ⚠️ CRITICAL FOR AUTH
**Problem**: OAuth callback URL must match exactly
**Required**: Update Google Cloud Console with production URLs

---

## 🔐 Environment Variables Setup

### Backend Environment Variables (.env in /backend directory)

```bash
# ========================================
# MongoDB Configuration
# ========================================
# Get from: https://cloud.mongodb.com
# Format: mongodb+srv://username:password@cluster.mongodb.net/
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=hrai_production

# ========================================
# Groq AI Configuration (CRITICAL - Core Feature)
# ========================================
# Get FREE key from: https://console.groq.com/keys
# Used for: Resume parsing and AI-powered screening
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE

# ========================================
# Google OAuth 2.0 Configuration (CRITICAL - Auth)
# ========================================
# Get from: https://console.cloud.google.com/apis/credentials
# Create OAuth 2.0 Client ID for Web Application
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# ========================================
# Frontend URL (UPDATE AFTER VERCEL DEPLOYMENT)
# ========================================
# Initially use: https://your-app-name.vercel.app
# Update after you know your Vercel URL
FRONTEND_URL=https://your-vercel-app.vercel.app

# ========================================
# CORS Origins (UPDATE AFTER VERCEL DEPLOYMENT)
# ========================================
# Comma-separated list of allowed origins
# Include both your Vercel URL and localhost for testing
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```

### Frontend Environment Variables (.env in /frontend directory)

```bash
# ========================================
# Backend API URL (UPDATE AFTER RENDER DEPLOYMENT)
# ========================================
# This should point to your Render backend URL
# Format: https://your-service-name.onrender.com
REACT_APP_BACKEND_URL=https://your-render-backend.onrender.com
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for FREE tier (M0 Sandbox - 512MB storage)
3. Choose cloud provider (AWS recommended) and region closest to your users

### Step 2: Create Database Cluster
1. Click "Build a Database"
2. Select **FREE** tier (M0)
3. Choose region (e.g., US East, Europe West)
4. Name your cluster (e.g., "hrai-cluster")
5. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username (e.g., `hrai-admin`)
5. Generate/set a strong password **SAVE THIS**
6. Set privileges to "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, you can restrict to Render's IP ranges
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Python" and version "3.11 or later"
5. Copy the connection string:
   ```
   mongodb+srv://hrai-admin:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password
7. **This is your `MONGO_URL`**

### Step 6: Set Database Name
- Use `hrai_production` as your `DB_NAME`
- MongoDB will create this automatically when first accessed

---

## 🔧 Backend Deployment (Render)

### Step 1: Fix Critical Code Issue
⚠️ **MUST DO BEFORE DEPLOYING**

Edit `backend/server.py`, find line 1686 and replace:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

With:
```python
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

**Commit and push this change to GitHub before proceeding!**

### Step 2: Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub (recommended for easier deployment)
3. Authorize Render to access your repositories

### Step 3: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Nithin-2413/hrmhrm`
3. Select branch: `kj` (or your main branch)
4. Configure the service:

```yaml
Name: hrai-backend (or your preferred name)
Region: Choose closest to your users (e.g., Oregon USA, Frankfurt Europe)
Branch: kj
Root Directory: (leave empty - we'll specify in commands)
Runtime: Python 3
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
Instance Type: Free (or paid for better performance)
```

### Step 4: Add Environment Variables
In Render dashboard, go to "Environment" tab and add ALL these variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `MONGO_URL` | Your MongoDB connection string | From MongoDB Atlas (Step 5 of Database Setup) |
| `DB_NAME` | `hrai_production` | Choose any name |
| `GROQ_API_KEY` | Your Groq API key | https://console.groq.com/keys |
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID | Google Cloud Console (see next section) |
| `GOOGLE_CLIENT_SECRET` | Your OAuth Client Secret | Google Cloud Console |
| `FRONTEND_URL` | `https://your-app.vercel.app` | **Add after Vercel deployment** |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | **Add after Vercel deployment** |
| `PYTHON_VERSION` | `3.11.0` | Ensure compatibility |

**⚠️ Important**: After adding each variable, DON'T deploy yet. Wait until all variables are added.

### Step 5: Get Google OAuth Credentials

#### Create Google Cloud Project
1. Go to: https://console.cloud.google.com
2. Create new project: "HRAI Production"
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

#### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: "HRAI"
   - Support email: Your email
   - Authorized domains: Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Application type: **Web application**
5. Name: "HRAI Production"
6. **Authorized JavaScript origins**: Add both:
   ```
   https://your-app.vercel.app
   http://localhost:3000
   ```
7. **Authorized redirect URIs**: Add both:
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
8. Click "Create"
9. **Save your Client ID and Client Secret** - add to Render environment variables

**⚠️ CRITICAL**: You'll need to update these URIs after you know your Vercel URL!

### Step 6: Deploy Backend
1. Once all environment variables are added, click "Create Web Service"
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. Once successful, you'll see: **"Live ✓"** status
5. **Copy your backend URL**: `https://your-service-name.onrender.com`

### Step 7: Test Backend
Once deployed, test the health endpoint:
```bash
curl https://your-backend-url.onrender.com/api/auth/me
```

Expected response: `401` error (means backend is working, just not authenticated)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to: https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Select your repository: `Nithin-2413/hrmhrm`
3. Configure project:

```yaml
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
Install Command: yarn install
Node Version: 18.x (or 20.x)
```

### Step 3: Add Environment Variable
Click "Environment Variables" and add:

| Variable Name | Value | 
|--------------|-------|
| `REACT_APP_BACKEND_URL` | `https://your-render-backend.onrender.com` |

**Use the backend URL from Step 6 of Backend Deployment**

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy (5-10 minutes)
3. Once complete, you'll get your production URL: `https://your-app.vercel.app`

### Step 5: Update Backend Environment Variables
**CRITICAL STEP** - Go back to Render and update these variables:

1. Open your Render backend service
2. Go to "Environment" tab
3. Update:
   - `FRONTEND_URL`: `https://your-actual-vercel-url.vercel.app`
   - `CORS_ORIGINS`: `https://your-actual-vercel-url.vercel.app,http://localhost:3000`
4. Click "Save Changes"
5. Render will automatically redeploy with new settings

### Step 6: Update Google OAuth URIs
1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Update **Authorized JavaScript origins**:
   - Replace placeholder with actual Vercel URL
4. Update **Authorized redirect URIs**:
   - Replace placeholder with actual Vercel URL + `/auth/callback`
5. Save changes

---

## ✅ Post-Deployment Verification

### 1. Test Frontend Access
1. Open your Vercel URL in browser
2. You should see the landing page with "AIR-ecruiter" branding
3. Check browser console for any errors

### 2. Test Backend Connection
1. Open browser DevTools (F12) → Network tab
2. Try to login (it will redirect to Google)
3. Check if API calls to `/api/*` are reaching your backend
4. Check for CORS errors (should be none if configured correctly)

### 3. Test Authentication Flow
1. Click "Sign in with Google" on landing page
2. Authorize with your Google account
3. Should redirect back and land on Dashboard
4. If successful, authentication is working! 🎉

### 4. Test Core Features
1. **Create Job**: Go to Jobs page, create a new job description
2. **Upload Resume**: Go to Screening, upload a PDF/DOCX resume
3. **Screen Resume**: Select job and resumes, click "Screen"
4. **Check AI Response**: Verify screening results show up with scores

### 5. Monitor Logs
**Backend logs** (Render):
- Go to your Render service → "Logs" tab
- Watch for errors during requests

**Frontend logs** (Vercel):
- Go to your Vercel project → "Deployments" → Select deployment → "Functions" tab
- Check for build or runtime errors

---

## 🐛 Troubleshooting

### Issue: Backend Not Starting on Render
**Symptoms**: Build succeeds but service shows "Deploy failed"

**Possible Causes**:
1. **Port issue**: Verify you fixed the hardcoded port (Issue #1)
2. **Missing environment variables**: Check all required vars are set
3. **MongoDB connection failed**: Verify MONGO_URL is correct and network access is open

**Solutions**:
```bash
# Check Render logs for exact error
# Common fixes:
1. Verify server.py uses: port = int(os.environ.get("PORT", 8001))
2. Check MONGO_URL format: mongodb+srv://user:pass@cluster.mongodb.net/
3. Ensure MongoDB IP whitelist includes 0.0.0.0/0
4. Check GROQ_API_KEY is valid: https://console.groq.com/keys
```

### Issue: Frontend Can't Connect to Backend
**Symptoms**: "Network Error" or CORS errors in browser console

**Possible Causes**:
1. **Wrong backend URL**: REACT_APP_BACKEND_URL not set correctly
2. **CORS not configured**: Backend CORS_ORIGINS doesn't include frontend URL
3. **Backend offline**: Render service crashed or sleeping (free tier)

**Solutions**:
```bash
# 1. Verify environment variable
Frontend .env: REACT_APP_BACKEND_URL=https://correct-backend-url.onrender.com

# 2. Verify CORS on backend
Backend env: CORS_ORIGINS=https://your-vercel-url.vercel.app

# 3. Wake up backend (free tier sleeps after 15min inactivity)
curl https://your-backend.onrender.com/api/auth/me

# 4. Check browser console for exact error
# If CORS: Update CORS_ORIGINS on Render
# If 404: Check REACT_APP_BACKEND_URL
```

### Issue: Google OAuth Not Working
**Symptoms**: "Error 400: redirect_uri_mismatch" or auth fails

**Possible Causes**:
1. **Redirect URI mismatch**: Google Console URIs don't match deployment URLs
2. **Wrong credentials**: Using development credentials instead of production
3. **FRONTEND_URL wrong**: Backend has wrong frontend URL configured

**Solutions**:
```bash
# 1. Check Google Cloud Console → Credentials
Authorized JavaScript origins: https://your-app.vercel.app
Authorized redirect URIs: https://your-app.vercel.app/auth/callback

# 2. Verify backend environment
FRONTEND_URL=https://your-app.vercel.app (exact match to Vercel URL)
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret

# 3. Check browser URL during auth
Should redirect to: https://accounts.google.com/o/oauth2/v2/auth?...
Then callback to: https://your-app.vercel.app/auth/callback?code=...
```

### Issue: AI Features Not Working (Resume Screening Fails)
**Symptoms**: Upload works but screening fails with 500 error

**Possible Causes**:
1. **Groq API key invalid/missing**
2. **Rate limit exceeded** (free tier limits)
3. **Model not available**

**Solutions**:
```bash
# 1. Verify Groq API key
Go to: https://console.groq.com/keys
Generate new key if needed
Update GROQ_API_KEY in Render environment

# 2. Check Render logs for Groq error
Look for: "AI screening error" or "Groq" in logs

# 3. Test API key manually
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Should return list of available models including llama-3.3-70b-versatile
```

### Issue: MongoDB Connection Failed
**Symptoms**: Backend logs show "MongoError" or connection refused

**Possible Causes**:
1. **Wrong connection string format**
2. **Password contains special characters not URL-encoded**
3. **IP not whitelisted**
4. **Database user doesn't have permissions**

**Solutions**:
```bash
# 1. Verify MONGO_URL format
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# 2. URL-encode password if it contains special characters
Example: p@ssw0rd! → p%40ssw0rd%21
Use: https://www.urlencoder.org

# 3. Check MongoDB Atlas Network Access
Should have: 0.0.0.0/0 (Allow from anywhere)

# 4. Verify database user permissions
MongoDB Atlas → Database Access → User should have "Read and write" role
```

### Issue: Vercel Build Fails
**Symptoms**: Deployment fails during build step

**Possible Causes**:
1. **Wrong Node version**
2. **CRACO build issues**
3. **Missing dependencies**

**Solutions**:
```bash
# 1. Check Node version in Vercel settings
Should be: 18.x or 20.x

# 2. Check build logs for specific error
Common issues:
- "Module not found": yarn.lock out of sync → delete and regenerate
- "CRACO error": Check craco.config.js is valid

# 3. Try local build to reproduce
cd frontend
yarn install
yarn build

# If it works locally, issue is in Vercel config
```

### Issue: Frontend Shows Blank Page
**Symptoms**: Deployment succeeds but page is white/blank

**Possible Causes**:
1. **JavaScript error on page load**
2. **Missing environment variable**
3. **Build output directory wrong**

**Solutions**:
```bash
# 1. Open browser console (F12)
Look for red errors

# 2. Check Vercel environment variables
REACT_APP_BACKEND_URL must be set

# 3. Verify build settings in Vercel
Output Directory: build (not dist or public)
Build Command: yarn build

# 4. Check Vercel function logs
Vercel Dashboard → Functions tab → Look for errors
```

---

## 📊 Environment Variables Checklist

### Backend (Render) - All Required
- [ ] `MONGO_URL` - MongoDB connection string from Atlas
- [ ] `DB_NAME` - Database name (e.g., hrai_production)
- [ ] `GROQ_API_KEY` - AI API key from Groq
- [ ] `GOOGLE_CLIENT_ID` - OAuth client ID from Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth secret from Google Console
- [ ] `FRONTEND_URL` - Your Vercel deployment URL
- [ ] `CORS_ORIGINS` - Comma-separated allowed origins including Vercel URL
- [ ] `PYTHON_VERSION` - Set to 3.11.0

### Frontend (Vercel) - Required
- [ ] `REACT_APP_BACKEND_URL` - Your Render backend URL

### Google OAuth (Google Cloud Console) - Required
- [ ] Authorized JavaScript origins: Add Vercel URL
- [ ] Authorized redirect URIs: Add Vercel URL + `/auth/callback`

---

## 🎯 Deployment Order Summary

1. ✅ **Fix backend code** (port configuration)
2. ✅ **Setup MongoDB Atlas** (get connection string)
3. ✅ **Get Groq API key** (for AI features)
4. ✅ **Setup Google OAuth** (get client ID & secret)
5. ✅ **Deploy Backend to Render** (with all env vars)
6. ✅ **Deploy Frontend to Vercel** (with backend URL)
7. ✅ **Update backend** with frontend URL
8. ✅ **Update Google OAuth** with production URLs
9. ✅ **Test everything**

---

## 🔗 Important Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Groq Console**: https://console.groq.com
- **Google Cloud Console**: https://console.cloud.google.com
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/Nithin-2413/hrmhrm

---

## 📝 Notes

### Free Tier Limitations

**Render Free Tier**:
- ✅ 750 hours/month (enough for 1 service 24/7)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start takes 30-60 seconds when waking up
- ✅ Upgrade to $7/month for always-on

**Vercel Free Tier**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ No cold starts

**MongoDB Atlas Free Tier**:
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Good for development & small production

**Groq Free Tier**:
- ✅ Generous rate limits
- ✅ Access to Llama 3.3 70B model
- ✅ Fast inference

### Performance Considerations

1. **Backend Cold Starts**: First request after 15min will be slow (free tier)
2. **Database Connection**: MongoDB Atlas shared cluster is slower than dedicated
3. **AI Processing**: Resume screening takes 2-5 seconds per resume
4. **File Uploads**: Limited to 10MB per resume

### Security Best Practices

1. **Never commit .env files** (already in .gitignore ✓)
2. **Rotate API keys** periodically
3. **Use strong MongoDB passwords**
4. **Monitor Groq API usage** for unexpected spikes
5. **Review OAuth scopes** - only request what you need
6. **Enable 2FA** on all service accounts

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Frontend loads at Vercel URL
- ✅ Google OAuth sign-in works
- ✅ Can create job descriptions
- ✅ Can upload resumes (PDF/DOCX)
- ✅ AI resume screening returns results
- ✅ Dashboard shows analytics
- ✅ Calendar features work
- ✅ Email generation works
- ✅ No CORS errors in console
- ✅ No authentication errors

---

## 🆘 Still Having Issues?

If you're still stuck after trying the troubleshooting steps:

1. **Check Render logs** - Most issues are visible here
2. **Check browser console** - Frontend errors show here
3. **Test backend independently** - Use curl or Postman
4. **Verify all environment variables** - Double-check spelling and values
5. **Try redeploying** - Sometimes helps with cache issues

**Common "gotchas"**:
- Forgot to update FRONTEND_URL on backend after Vercel deployment
- Forgot to update Google OAuth redirect URIs
- MongoDB password has special characters that need URL encoding
- Vercel environment variable `REACT_APP_BACKEND_URL` missing the `https://`

---

## 📚 Additional Resources

- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **React Deployment**: https://create-react-app.dev/docs/deployment/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

---

**Good luck with your deployment! 🚀**

If you followed this guide and everything is configured correctly, your HRAI application should be live and fully functional!
