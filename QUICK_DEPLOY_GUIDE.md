# 🚀 Quick Deploy Guide - AIRecruiter

## ⚡ Fast Track to Deployment (30 Minutes)

### ✅ Step 1: Critical Code Fix (ALREADY DONE!)
The hardcoded port issue in `/app/backend/server.py` has been **FIXED**! ✅

**What was fixed:**
```python
# Before (BROKEN):
uvicorn.run(app, host="0.0.0.0", port=8001)

# After (FIXED):
port = int(os.environ.get("PORT", 8001))
uvicorn.run(app, host="0.0.0.0", port=port)
```

Your code is now ready for cloud deployment! 🎉

---

### 📋 Step 2: Get Your API Keys (15 minutes)

#### A. MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com/
2. Sign up → Create FREE M0 cluster
3. Create database user (save username & password)
4. Network Access → Add IP: `0.0.0.0/0`
5. Click "Connect" → Copy connection string
6. **You need:** `MONGO_URL` and `DB_NAME`

#### B. Groq AI (FREE - Core AI Features)
1. Go to https://console.groq.com/keys
2. Sign up/login (free account)
3. Create new API key
4. **You need:** `GROQ_API_KEY` (starts with `gsk_`)

#### C. Google OAuth (Authentication)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create project → Enable "Google+ API"
3. Create OAuth 2.0 Client ID → Web Application
4. Add redirect URIs:
   - `http://localhost:8001/api/auth/callback`
   - `https://YOUR-BACKEND.onrender.com/api/auth/callback` (add later)
5. **You need:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

### 🔧 Step 3: Configure Environment Variables (5 minutes)

#### Backend Setup
```bash
# Navigate to backend directory
cd /app/backend

# Copy template and edit
cp .env.template .env
nano .env  # or use any text editor
```

**Fill in these values:**
```bash
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=hrai_production
GROQ_API_KEY=gsk_your_actual_key_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd /app/frontend

# Copy template and edit
cp .env.template .env
nano .env  # or use any text editor
```

**Fill in this value:**
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

### 🧪 Step 4: Test Locally (5 minutes)

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001

# In another terminal - Frontend
cd /app/frontend
yarn install
yarn start
```

**Test checklist:**
- [ ] Open http://localhost:3000
- [ ] Can you see the landing page?
- [ ] Does Google login work?
- [ ] Can you create a job description?
- [ ] Can you upload a resume?

If YES to all → Ready to deploy! 🚀

---

### ☁️ Step 5: Deploy to Cloud (15 minutes)

#### Deploy Backend (Render)
1. Go to https://render.com/ → Sign up
2. New → Web Service → Connect your repo
3. Settings:
   - **Name:** `airecruiter-backend`
   - **Root Directory:** Leave empty
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables (from your backend .env):
   - `MONGO_URL`
   - `DB_NAME`
   - `GROQ_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (use your Vercel URL - see Step 5B)
   - `CORS_ORIGINS` (use your Vercel URL)
5. Click "Create Web Service"
6. **Copy your backend URL:** `https://airecruiter-backend.onrender.com`

#### Deploy Frontend (Vercel)
1. Go to https://vercel.com/ → Sign up
2. New Project → Import your repo
3. Settings:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`
4. Environment Variables:
   - Key: `REACT_APP_BACKEND_URL`
   - Value: Your Render backend URL (e.g., `https://airecruiter-backend.onrender.com`)
5. Click "Deploy"
6. **Copy your frontend URL:** `https://your-app.vercel.app`

#### Update Backend on Render
1. Go back to Render dashboard
2. Update environment variables:
   - `FRONTEND_URL`: Your Vercel URL
   - `CORS_ORIGINS`: Your Vercel URL
3. Redeploy backend

#### Update Google OAuth
1. Go to Google Cloud Console
2. Update OAuth redirect URIs:
   - Add: `https://airecruiter-backend.onrender.com/api/auth/callback`
3. Save

---

### 🎯 Step 6: Verify Deployment (5 minutes)

Visit your Vercel URL and test:
- [ ] Landing page loads
- [ ] Google OAuth login works
- [ ] Can create job descriptions
- [ ] Can upload resumes
- [ ] AI screening works
- [ ] Email generation works

**If something doesn't work:**
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure MongoDB allows connections from 0.0.0.0/0

---

## 🎉 You're Live!

Your AIRecruiter app is now deployed and accessible worldwide!

**Next steps:**
- Add custom domain (Vercel)
- Set up monitoring
- Configure backups for MongoDB
- Add rate limiting

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Render logs, verify PORT is dynamic |
| Frontend can't connect | Verify CORS_ORIGINS includes your Vercel URL |
| OAuth fails | Verify Google redirect URIs match exactly |
| MongoDB connection fails | Check MONGO_URL format and network access |
| AI features don't work | Verify GROQ_API_KEY is valid |

---

**Estimated Total Time:** 30-45 minutes  
**Difficulty:** Medium  
**Cost:** $0 (all services have free tiers)

Good luck! 🚀
