# 🚨 CRITICAL FIXES REQUIRED BEFORE DEPLOYMENT

## Priority 1: MUST FIX (Deployment Blockers)

### 1. Fix Hardcoded Port in Backend ⚠️ CRITICAL
**File**: `backend/server.py` (Line 1686)

**Current Code**:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Fixed Code**:
```python
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

**Why**: Render uses dynamic `PORT` environment variable. Without this fix, your backend will crash on startup.

**Action**: 
1. Open `backend/server.py`
2. Go to line 1684-1686
3. Replace with the fixed code above
4. Commit and push to GitHub

---

## Priority 2: Add Configuration Files

### 2. Create .env.example Files ✅ COMPLETED
**Location**: Repository root and frontend directory

These files have been created for you:
- `/.env.example` - Backend environment variables template
- `/frontend/.env.example` - Frontend environment variables template

**Action**: Already created - included in deployment files

---

### 3. Create vercel.json ✅ COMPLETED
**Location**: Repository root

Configuration for Vercel frontend deployment.

**Action**: Already created - included in deployment files

---

### 4. Create render.yaml ✅ COMPLETED
**Location**: Repository root

Configuration for Render backend deployment.

**Action**: Already created - included in deployment files

---

## Priority 3: Optional Improvements

### 5. Email Generation Word Count ✅ ALREADY IMPLEMENTED
**Status**: The prompts already specify 300-340 words (close to 300-350)

**Verification**:
```bash
grep -n "300-340 words" backend/server.py
```

Shows all email templates correctly specify word count requirements.

**Action**: No changes needed - requirement already met

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

### Required Services & API Keys
- [ ] **MongoDB Atlas Account** + Connection String
- [ ] **Groq AI API Key** (FREE from https://console.groq.com)
- [ ] **Google OAuth Credentials** (Client ID + Secret)
- [ ] **Vercel Account** (FREE)
- [ ] **Render Account** (FREE tier available)

### Code Fixes
- [ ] **Fixed port in server.py** (Priority 1 above)
- [ ] **Committed and pushed changes to GitHub**

### Configuration Files (Already Created)
- [x] `.env.example` files
- [x] `vercel.json`
- [x] `render.yaml`
- [x] `COMPLETE_DEPLOYMENT_GUIDE.md`

---

## 🚀 Deployment Steps Summary

### Step 1: Fix Code (DO THIS FIRST!)
```bash
# 1. Edit backend/server.py line 1686
# 2. Change port=8001 to port=int(os.environ.get("PORT", 8001))
# 3. Save file
git add backend/server.py
git commit -m "Fix: Use dynamic PORT for Render deployment"
git push origin kj
```

### Step 2: Setup MongoDB Atlas
1. Create account at https://cloud.mongodb.com
2. Create FREE M0 cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string (MONGO_URL)

### Step 3: Get API Keys
1. **Groq AI**: https://console.groq.com/keys
2. **Google OAuth**: https://console.cloud.google.com/apis/credentials

### Step 4: Deploy Backend (Render)
1. Connect GitHub repository
2. Configure build settings:
   - Build: `cd backend && pip install -r requirements.txt`
   - Start: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
3. Add ALL environment variables (see guide)
4. Deploy!

### Step 5: Deploy Frontend (Vercel)
1. Import GitHub repository
2. Set root directory: `frontend`
3. Add environment variable: `REACT_APP_BACKEND_URL`
4. Deploy!

### Step 6: Update Backend with Frontend URL
1. Go back to Render
2. Update `FRONTEND_URL` and `CORS_ORIGINS`
3. Service will auto-redeploy

### Step 7: Update Google OAuth
1. Go to Google Cloud Console
2. Update Authorized JavaScript origins
3. Update Authorized redirect URIs
4. Use actual Vercel URL

### Step 8: Test Everything! ✅
- [ ] Frontend loads
- [ ] Login works
- [ ] Can create jobs
- [ ] Can upload resumes
- [ ] AI screening works
- [ ] No CORS errors

---

## 📁 Files Included in This Package

1. **COMPLETE_DEPLOYMENT_GUIDE.md** - Full step-by-step deployment instructions
2. **.env.example** - Backend environment variables template
3. **frontend/.env.example** - Frontend environment variables template
4. **vercel.json** - Vercel deployment configuration
5. **render.yaml** - Render deployment configuration
6. **FIXES_REQUIRED.md** - This file (critical fixes summary)

---

## 🔗 Quick Links

- **Full Deployment Guide**: See `COMPLETE_DEPLOYMENT_GUIDE.md`
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Groq Console**: https://console.groq.com
- **Google Cloud Console**: https://console.cloud.google.com
- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard

---

## ⚠️ Common Issues

### Issue: Backend crashes on Render
**Cause**: Forgot to fix hardcoded port
**Solution**: Apply Priority 1 fix above

### Issue: Frontend can't reach backend
**Cause**: Wrong `REACT_APP_BACKEND_URL`
**Solution**: Set to actual Render URL in Vercel environment variables

### Issue: CORS errors
**Cause**: Backend `CORS_ORIGINS` doesn't include frontend URL
**Solution**: Update `CORS_ORIGINS` on Render to include Vercel URL

### Issue: Google OAuth fails
**Cause**: Redirect URIs don't match
**Solution**: Update Google Console with actual production URLs

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Backend shows "Live" on Render
- ✅ Frontend loads at Vercel URL
- ✅ Google login works
- ✅ Can upload and screen resumes
- ✅ AI features return results
- ✅ No errors in browser console

---

## 🆘 Need Help?

1. Check `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Check Render logs for backend errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

**Most common mistake**: Forgetting to update `FRONTEND_URL` on backend after Vercel deployment!

---

**Good luck! 🚀**
