#!/bin/bash

# =====================================================
# AIRecruiter Pre-Deployment Verification Script
# =====================================================
# Run this script to verify your setup before deploying

echo "🔍 AIRecruiter Pre-Deployment Verification"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Backend .env file
echo "📋 Checking Backend Configuration..."
if [ -f "/app/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
    
    # Check for required variables
    if grep -q "MONGO_URL=" /app/backend/.env && ! grep -q "YOUR_USERNAME" /app/backend/.env; then
        echo -e "${GREEN}✓${NC} MONGO_URL is configured"
    else
        echo -e "${RED}✗${NC} MONGO_URL is missing or not configured"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "GROQ_API_KEY=" /app/backend/.env && ! grep -q "YOUR_GROQ" /app/backend/.env; then
        echo -e "${GREEN}✓${NC} GROQ_API_KEY is configured"
    else
        echo -e "${RED}✗${NC} GROQ_API_KEY is missing or not configured"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "GOOGLE_CLIENT_ID=" /app/backend/.env && ! grep -q "YOUR_CLIENT" /app/backend/.env; then
        echo -e "${GREEN}✓${NC} GOOGLE_CLIENT_ID is configured"
    else
        echo -e "${RED}✗${NC} GOOGLE_CLIENT_ID is missing or not configured"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "GOOGLE_CLIENT_SECRET=" /app/backend/.env && ! grep -q "YOUR_CLIENT" /app/backend/.env; then
        echo -e "${GREEN}✓${NC} GOOGLE_CLIENT_SECRET is configured"
    else
        echo -e "${RED}✗${NC} GOOGLE_CLIENT_SECRET is missing or not configured"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Backend .env file does not exist"
    echo "   Create it from: cp /app/backend/.env.template /app/backend/.env"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Frontend .env file
echo "📋 Checking Frontend Configuration..."
if [ -f "/app/frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env file exists"
    
    if grep -q "REACT_APP_BACKEND_URL=" /app/frontend/.env; then
        echo -e "${GREEN}✓${NC} REACT_APP_BACKEND_URL is configured"
    else
        echo -e "${RED}✗${NC} REACT_APP_BACKEND_URL is missing"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Frontend .env file does not exist"
    echo "   Create it from: cp /app/frontend/.env.template /app/frontend/.env"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Critical code fix
echo "🔧 Checking Critical Code Fixes..."
if grep -q 'port = int(os.environ.get("PORT", 8001))' /app/backend/server.py; then
    echo -e "${GREEN}✓${NC} Dynamic port configuration is correct"
else
    echo -e "${RED}✗${NC} Hardcoded port still exists in server.py"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Dependencies
echo "📦 Checking Dependencies..."
if [ -f "/app/backend/requirements.txt" ]; then
    echo -e "${GREEN}✓${NC} Backend requirements.txt exists"
    if grep -q "groq==1.0.0" /app/backend/requirements.txt; then
        echo -e "${GREEN}✓${NC} Groq version is correct (1.0.0)"
    else
        echo -e "${YELLOW}⚠${NC}  Groq version might not be 1.0.0"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} Backend requirements.txt missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "/app/frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} Frontend package.json exists"
else
    echo -e "${RED}✗${NC} Frontend package.json missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Database configuration
echo "🗄️  Checking Database Setup..."
if [ -f "/app/backend/.env" ]; then
    if grep -q "DB_NAME=" /app/backend/.env; then
        echo -e "${GREEN}✓${NC} DB_NAME is configured"
    else
        echo -e "${YELLOW}⚠${NC}  DB_NAME is not set (will use default)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Check 6: Deployment files
echo "🚀 Checking Deployment Files..."
if [ -f "/app/render.yaml" ]; then
    echo -e "${GREEN}✓${NC} render.yaml exists (Render deployment ready)"
else
    echo -e "${YELLOW}⚠${NC}  render.yaml missing (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "/app/vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json exists (Vercel deployment ready)"
else
    echo -e "${YELLOW}⚠${NC}  vercel.json missing (optional)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "==========================================="
echo "📊 Verification Summary"
echo "==========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! You're ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review /app/DEPLOYMENT_SUMMARY.md"
    echo "2. Follow /app/QUICK_DEPLOY_GUIDE.md"
    echo "3. Deploy your application"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found${NC}"
    echo "You can still deploy, but review the warnings above."
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    echo "Check these files for help:"
    echo "- /app/DEPLOYMENT_SUMMARY.md"
    echo "- /app/QUICK_DEPLOY_GUIDE.md"
    echo "- /app/backend/.env.template"
    echo "- /app/frontend/.env.template"
    exit 1
fi
