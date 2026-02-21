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
