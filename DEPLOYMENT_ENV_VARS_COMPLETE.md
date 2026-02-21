# 🔐 COMPLETE ENVIRONMENT VARIABLES GUIDE - AIRecruiter

## ✅ ALL FIXES APPLIED - SUMMARY

### Critical Fixes Completed:

1. ✅ **startTime ReferenceError FIXED**
   - Moved `startTime` declaration to function scope in Dashboard.js
   - Variable now accessible in both try and catch blocks
   - No more "startTime is not defined" error

2. ✅ **Backend Server Crash FIXED**
   - Made all environment variables optional with fallbacks
   - Server now starts even without API keys
   - AI features gracefully disabled when keys missing

3. ✅ **AI Feature Graceful Degradation**
   - Resume parsing returns mock data when Groq API key missing
   - ATS screening returns mock scores when AI disabled
   - Email generation shows helpful message when AI unavailable
   - All features work in "demo mode" without AI keys

4. ✅ **Environment Files Created**
   - `/app/backend/.env` - Backend configuration
   - `/app/frontend/.env` - Frontend configuration
   - Both configured for local development

5. ✅ **Database Connection Fixed**
   - Using local MongoDB (already running)
   - Connection defaults to `mongodb://localhost:27017/`
   - Database name: `hrai_development`

---

## 🎯 DEPLOYMENT ENVIRONMENT VARIABLES

### Backend Environment Variables
**Platform:** Render, Railway, Heroku, etc.  
**Location:** Add these in your deployment platform's environment variables dashboard

| Variable Name | Example Value | Required? | Where to Get |
|---------------|---------------|-----------|--------------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` | ✅ YES | https://cloud.mongodb.com |
| `DB_NAME` | `hrai_production` | ✅ YES | Choose any name |
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxxx` | ⚠️ RECOMMENDED | https://console.groq.com/keys (FREE) |
| `GOOGLE_CLIENT_ID` | `123456.apps.googleusercontent.com` | ⚠️ OPTIONAL | https://console.cloud.google.com/apis/credentials |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxx` | ⚠️ OPTIONAL | https://console.cloud.google.com/apis/credentials |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ YES | Your Vercel URL after deployment |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | ✅ YES | Your Vercel URL (comma-separated for multiple) |
| `PORT` | Auto-set by platform | ❌ NO | Platform provides this automatically |

### Frontend Environment Variables
**Platform:** Vercel, Netlify, etc.  
**Location:** Add these in your deployment platform's environment variables section

| Variable Name | Example Value | Required? | Where to Get |
|---------------|---------------|-----------|--------------|
| `REACT_APP_BACKEND_URL` | `https://your-backend.onrender.com` | ✅ YES | Your Render URL after backend deployment |

---

## 🚀 WHAT WORKS WITHOUT API KEYS

### ✅ Features That Work WITHOUT Groq API Key:
1. **Dashboard** - Displays all data, metrics, analytics
2. **Job Management** - Create, edit, delete job descriptions
3. **Resume Upload** - Upload and store resumes (basic parsing)
4. **Screening** - Manual screening with mock AI scores (75-80 range)
5. **Calendar** - Full calendar functionality
6. **Analytics** - Charts and metrics
7. **User Interface** - All UI features work perfectly

### ⚠️ Features That Need Groq API Key (for full AI):
1. **AI Resume Parsing** - Detailed extraction (name, email, skills, experience)
2. **AI ATS Screening** - Intelligent scoring (0-100 with detailed analysis)
3. **AI Email Generation** - Personalized recruitment emails

**Note:** Without Groq API key, these features show helpful messages and mock data, so the app is still usable.

### ⚠️ Features That Need Google OAuth (optional):
1. **Google Login** - Social authentication
2. **OAuth-based user management**

**Note:** Without OAuth, you can still use the app, but authentication is limited.

---

## 📋 DEPLOYMENT CHECKLIST - EXACT STEPS

### Phase 1: MongoDB Setup (15 minutes)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up (FREE)

2. **Create Cluster**
   - Click "Create" → Choose FREE M0 tier
   - Select region closest to your users
   - Click "Create Cluster"

3. **Create Database User**
   - Left sidebar → "Database Access"
   - Click "Add New Database User"
   - Username: `airecruiter-admin` (or your choice)
   - Password: Generate strong password **SAVE THIS**
   - Built-in Role: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Left sidebar → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - **This is your `MONGO_URL`**

Example: `mongodb+srv://airecruiter-admin:MySecurePass123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

### Phase 2: Get Groq API Key (3 minutes) - RECOMMENDED

1. Go to https://console.groq.com/keys
2. Sign up/Login (FREE account)
3. Click "Create API Key"
4. Name it "AIRecruiter Production"
5. Copy the key (starts with `gsk_`)
6. **This is your `GROQ_API_KEY`**

Example: `gsk_ABcd1234EFgh5678IJkl9012MNop3456QRst7890`

**FREE Tier Limits:**
- 30 requests per minute
- 6,000 requests per day
- More than enough for most use cases

---

### Phase 3: Google OAuth Setup (10 minutes) - OPTIONAL

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **Create Project**
   - Click project dropdown → "New Project"
   - Name: "AIRecruiter"
   - Click "Create"

3. **Enable Google+ API**
   - Left menu → "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "AIRecruiter Web"

5. **Add Authorized Redirect URIs**
   - Click "Add URI" under "Authorized redirect URIs"
   - Add: `https://your-backend.onrender.com/api/auth/callback`
   - (Replace with your actual Render URL after deployment)
   - Click "Create"

6. **Save Credentials**
   - Copy "Client ID" → **This is your `GOOGLE_CLIENT_ID`**
   - Copy "Client Secret" → **This is your `GOOGLE_CLIENT_SECRET`**

---

### Phase 4: Deploy Backend to Render (15 minutes)

1. **Go to Render**
   - https://render.com → Sign up/Login

2. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name:** `airecruiter-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your branch)
   - **Root Directory:** Leave empty (or `backend` if repo structure requires)
   - **Environment:** `Python 3`
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   MONGO_URL = mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
   DB_NAME = hrai_production
   GROQ_API_KEY = gsk_your_key_here
   GOOGLE_CLIENT_ID = your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = GOCSPX-your_secret_here
   FRONTEND_URL = https://your-app.vercel.app
   CORS_ORIGINS = https://your-app.vercel.app
   ```
   
   **Note:** You'll update `FRONTEND_URL` and `CORS_ORIGINS` after deploying frontend

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - **Copy your backend URL:** `https://airecruiter-backend.onrender.com`

---

### Phase 5: Deploy Frontend to Vercel (10 minutes)

1. **Go to Vercel**
   - https://vercel.com → Sign up/Login

2. **Import Project**
   - Dashboard → "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn install && yarn build`
   - **Output Directory:** `build`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     - **Name:** `REACT_APP_BACKEND_URL`
     - **Value:** `https://airecruiter-backend.onrender.com` (your Render URL)

5. **Deploy**
   - Click "Deploy"
   - Wait for build (3-5 minutes)
   - **Copy your frontend URL:** `https://airecruiter.vercel.app`

---

### Phase 6: Update Backend URLs (5 minutes)

1. **Go back to Render dashboard**
2. **Update Environment Variables**
   - `FRONTEND_URL` = `https://airecruiter.vercel.app` (your Vercel URL)
   - `CORS_ORIGINS` = `https://airecruiter.vercel.app`
3. **Click "Save Changes"**
4. Backend will automatically redeploy

---

### Phase 7: Update Google OAuth (if using) (2 minutes)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **Edit OAuth Client**
   - Click your OAuth client name
   - Under "Authorized redirect URIs", add:
     - `https://airecruiter-backend.onrender.com/api/auth/callback`
   - Click "Save"

---

### Phase 8: Test Your Deployment (5 minutes)

1. **Visit your frontend URL:** `https://airecruiter.vercel.app`
2. **Test features:**
   - ✅ Landing page loads
   - ✅ Click "Get Started"
   - ✅ Dashboard loads
   - ✅ Create a job description
   - ✅ View calendar
   - ✅ Try email generation

3. **Check browser console** for any errors
4. **Check Render logs** if backend issues

---

## ⚠️ IMPORTANT NOTES

### Database Considerations:

**Will the database work in deployed environment?**
✅ **YES** - Your code is already configured correctly:
- Uses `AsyncIOMotorClient` (production-grade async driver)
- Connection string from environment variable
- No hardcoded values
- Works perfectly with MongoDB Atlas

**Do you need to create a database now?**
❌ **NO** - Wait until deployment:
- Local MongoDB works for development
- Create MongoDB Atlas when deploying to production
- Collections are created automatically when first used

### CORS Configuration:

✅ **Already Handled in Code:**
- Backend reads `CORS_ORIGINS` from environment
- Supports multiple origins (comma-separated)
- Will work perfectly after deployment with correct URLs

### Environment Variable References:

✅ **All Good:**
- No hardcoded values in code
- All API keys from environment variables
- Fallbacks for development (local MongoDB, optional AI)
- Production-ready configuration

---

## 🎯 MINIMAL DEPLOYMENT (Just to Get It Live)

If you want to deploy FAST and add features later:

**Required Environment Variables:**
```bash
# Backend (Render)
MONGO_URL=mongodb+srv://...
DB_NAME=hrai_production
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app

# Frontend (Vercel)
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

**Optional (Add Later):**
```bash
# Backend (Render)
GROQ_API_KEY=gsk_...              # For AI features
GOOGLE_CLIENT_ID=...              # For OAuth login
GOOGLE_CLIENT_SECRET=...          # For OAuth login
```

The app will work without Groq and Google OAuth - just AI and social login features will be disabled.

---

## 📊 SUMMARY

### What's Fixed:
✅ startTime error in Dashboard  
✅ Backend crash due to missing env vars  
✅ All API endpoints working  
✅ AI features with graceful fallback  
✅ Database connection  
✅ Environment files created  

### What You Need to Do:
1. Get MongoDB Atlas connection string (15 min)
2. Get Groq API key - optional but recommended (3 min)
3. Get Google OAuth credentials - optional (10 min)
4. Deploy backend to Render (15 min)
5. Deploy frontend to Vercel (10 min)
6. Update URLs in both platforms (5 min)

**Total Time:** 40-60 minutes

### What Will Work After Deployment:
✅ All features (with or without AI)  
✅ Dashboard, Jobs, Calendar, Screening  
✅ Analytics and visualizations  
✅ File uploads (resumes)  
✅ Mock AI features (if Groq key not added)  
✅ Full AI features (if Groq key added)  

---

**You're ready to deploy! 🚀**
