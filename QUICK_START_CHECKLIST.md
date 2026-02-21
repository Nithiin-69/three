# ⚡ QUICK START DEPLOYMENT CHECKLIST

## 🎯 Goal: Deploy HRAI (AIR-ecruiter) to Production in 2 Hours

---

## ⏱️ Phase 1: Pre-Deployment (5 minutes)

### ✅ Step 1: Fix Critical Code Issue
- [ ] Open `backend/server.py`
- [ ] Go to line 1684-1686
- [ ] Replace:
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
- [ ] Save file
- [ ] Commit: `git add backend/server.py && git commit -m "Fix: Use dynamic PORT for deployment"`
- [ ] Push: `git push origin kj`

---

## ⏱️ Phase 2: Setup External Services (30 minutes)

### 📦 Step 2: MongoDB Atlas (10 min)
- [ ] Go to https://cloud.mongodb.com/
- [ ] Sign up / Log in
- [ ] Create FREE M0 cluster
- [ ] Create database user (save username & password)
- [ ] Network Access → Allow 0.0.0.0/0
- [ ] Get connection string
- [ ] **Save MONGO_URL**: `mongodb+srv://user:pass@cluster.mongodb.net/`

### 🤖 Step 3: Groq AI API Key (2 min)
- [ ] Go to https://console.groq.com
- [ ] Sign up / Log in
- [ ] Go to API Keys
- [ ] Create new API key
- [ ] **Save GROQ_API_KEY**: `gsk_...`

### 🔐 Step 4: Google OAuth (15 min)
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project: "HRAI Production"
- [ ] Enable Google+ API
- [ ] Go to Credentials → Create OAuth 2.0 Client ID
- [ ] Configure consent screen
- [ ] Application type: Web application
- [ ] Add origins (temp): `http://localhost:3000`
- [ ] Add redirect URI (temp): `http://localhost:3000/auth/callback`
- [ ] Create
- [ ] **Save GOOGLE_CLIENT_ID**: `xxx.apps.googleusercontent.com`
- [ ] **Save GOOGLE_CLIENT_SECRET**: `xxx`

### 🌐 Step 5: Create Accounts (3 min)
- [ ] **Render**: https://render.com → Sign up with GitHub
- [ ] **Vercel**: https://vercel.com → Sign up with GitHub

---

## ⏱️ Phase 3: Deploy Backend to Render (20 minutes)

### 🚀 Step 6: Create Render Service
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub: `Nithin-2413/hrmhrm`
- [ ] Select branch: `kj`

### ⚙️ Step 7: Configure Service
```
Name: hrai-backend
Region: Oregon (USA) or closest to you
Branch: kj
Root Directory: (leave empty)
Runtime: Python 3
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 🔑 Step 8: Add Environment Variables
Click "Advanced" → Add Environment Variables:

| Key | Value |
|-----|-------|
| `MONGO_URL` | _(from Step 2)_ |
| `DB_NAME` | `hrai_production` |
| `GROQ_API_KEY` | _(from Step 3)_ |
| `GOOGLE_CLIENT_ID` | _(from Step 4)_ |
| `GOOGLE_CLIENT_SECRET` | _(from Step 4)_ |
| `FRONTEND_URL` | `https://temp.vercel.app` _(update later)_ |
| `CORS_ORIGINS` | `https://temp.vercel.app` _(update later)_ |
| `PYTHON_VERSION` | `3.11.0` |

- [ ] Add ALL 8 variables above
- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for deployment
- [ ] **Once Live, COPY YOUR BACKEND URL**: `https://xxx.onrender.com`

---

## ⏱️ Phase 4: Deploy Frontend to Vercel (15 minutes)

### 🌐 Step 9: Import Project to Vercel
- [ ] Go to Vercel Dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import `Nithin-2413/hrmhrm`
- [ ] Click "Import"

### ⚙️ Step 10: Configure Build Settings
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
Install Command: yarn install
```

### 🔑 Step 11: Add Environment Variable
Click "Environment Variables":

| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | _(your Render URL from Step 8)_ |

**Example**: `https://hrai-backend-xxx.onrender.com`

- [ ] Add variable
- [ ] Click "Deploy"
- [ ] Wait 5-10 minutes
- [ ] **Once Live, COPY YOUR FRONTEND URL**: `https://xxx.vercel.app`

---

## ⏱️ Phase 5: Final Configuration (10 minutes)

### 🔄 Step 12: Update Backend with Frontend URL
- [ ] Go back to Render Dashboard
- [ ] Open your backend service
- [ ] Go to "Environment" tab
- [ ] Update `FRONTEND_URL` with actual Vercel URL
- [ ] Update `CORS_ORIGINS` with actual Vercel URL
- [ ] **Example**: `https://hrai-app-abc123.vercel.app`
- [ ] Click "Save Changes"
- [ ] Service will auto-redeploy (wait 2 min)

### 🔐 Step 13: Update Google OAuth
- [ ] Go back to Google Cloud Console
- [ ] Go to Credentials → Edit your OAuth 2.0 Client ID
- [ ] **Authorized JavaScript origins**: Replace `localhost` with Vercel URL
  - Add: `https://your-vercel-url.vercel.app`
- [ ] **Authorized redirect URIs**: Replace `localhost` with Vercel URL
  - Add: `https://your-vercel-url.vercel.app/auth/callback`
- [ ] Save changes

---

## ⏱️ Phase 6: Verification (10 minutes)

### ✅ Step 14: Test Your Deployment

#### Test 1: Frontend Loads
- [ ] Open your Vercel URL in browser
- [ ] Should see AIR-ecruiter landing page
- [ ] No errors in console (F12 → Console)

#### Test 2: Backend is Reachable
- [ ] Open: `https://your-backend.onrender.com/docs`
- [ ] Should see FastAPI Swagger docs
- [ ] Backend is online ✅

#### Test 3: Authentication Works
- [ ] On landing page, click "Sign in with Google"
- [ ] Should redirect to Google
- [ ] Authorize with your Google account
- [ ] Should redirect back to dashboard
- [ ] If you see dashboard → Auth works! ✅

#### Test 4: Core Features Work
- [ ] **Create Job**: Click "Jobs" → "Create Job" → Fill form → Save
  - ✅ Job should appear in list
- [ ] **Upload Resume**: Click "Screening" → Upload PDF/DOCX
  - ✅ Resume should process and show in list
- [ ] **Screen Resume**: Select job & resume → Click "Screen"
  - ✅ Should see screening results with scores (wait 5-10 sec)

#### Test 5: No Errors
- [ ] Check browser console (F12) → No red errors
- [ ] Check Render logs → No error messages
- [ ] If all clean → Deployment successful! 🎉

---

## 🎉 SUCCESS!

If all tests pass, your application is LIVE and WORKING!

**Your URLs**:
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔧 Backend: `https://your-backend.onrender.com`
- 📚 API Docs: `https://your-backend.onrender.com/docs`

---

## 🐛 Quick Troubleshooting

### Backend not starting?
1. Check Render logs for errors
2. Verify MONGO_URL is correct
3. Verify all 8 environment variables are set
4. Check you pushed the port fix to GitHub

### Frontend can't reach backend?
1. Verify `REACT_APP_BACKEND_URL` in Vercel is correct
2. Check backend is "Live" on Render
3. Wake backend: `curl https://your-backend.onrender.com/api/auth/me`

### Google OAuth fails?
1. Check redirect URIs in Google Console match Vercel URL exactly
2. Verify `FRONTEND_URL` on Render matches Vercel URL
3. Make sure you updated OAuth after getting Vercel URL

### AI screening fails?
1. Check GROQ_API_KEY is valid
2. Check Render logs for specific error
3. Generate new API key at https://console.groq.com

---

## 📊 Time Breakdown

| Phase | Time | Status |
|-------|------|--------|
| Fix code | 5 min | [ ] |
| Setup services | 30 min | [ ] |
| Deploy backend | 20 min | [ ] |
| Deploy frontend | 15 min | [ ] |
| Final config | 10 min | [ ] |
| Verification | 10 min | [ ] |
| **Total** | **~90 min** | |

---

## 📚 Need More Help?

- 📖 **Full Guide**: See `COMPLETE_DEPLOYMENT_GUIDE.md`
- 🔍 **Analysis**: See `DEPLOYMENT_ANALYSIS.md`
- 🛠️ **Fixes**: See `FIXES_REQUIRED.md`

---

## 🎯 Pro Tips

1. **Bookmark your URLs**: Save frontend & backend URLs
2. **Save API keys securely**: Use password manager
3. **Monitor logs**: Check Render logs if issues occur
4. **Free tier limitations**: Backend sleeps after 15min inactivity (first request slow)
5. **Upgrade later**: Consider paid tiers for production (no cold starts)

---

**Ready? Let's deploy! 🚀**

Start with Phase 1 → Fix the code issue first!
