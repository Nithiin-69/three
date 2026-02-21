from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
from urllib.parse import urlencode, unquote, quote
import base64
import io
import re
import PyPDF2
import docx
from groq import Groq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Groq AI Client for Llama 3.3 (70B)
# Initialize as None if API key not provided (allows server to start)
groq_api_key = os.environ.get('GROQ_API_KEY')
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'hrai_development')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_id: Optional[str] = None  # For session-based auth
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime
    google_tokens: Optional[dict] = None

class SalaryRange(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    currency: str = "USD"

class JobDescription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    job_id: str
    user_id: str
    title: str
    department: Optional[str] = None
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid"
    description: str
    requirements: List[str] = []
    nice_to_have: List[str] = []
    salary_range: Optional[SalaryRange] = None
    status: str = "draft"  # draft, active, paused, closed
    created_at: datetime
    updated_at: datetime

class JobDescriptionCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid"
    description: str
    requirements: List[str] = []
    nice_to_have: List[str] = []
    salary_range: Optional[SalaryRange] = None
    status: str = "draft"

class JobDescriptionUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    nice_to_have: Optional[List[str]] = None
    salary_range: Optional[SalaryRange] = None
    status: Optional[str] = None

class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    resume_id: str
    user_id: str
    filename: str
    file_content: str  # base64 encoded
    file_type: str  # pdf or docx
    extracted_text: str
    # Enhanced parsed data
    parsed_name: Optional[str] = None
    parsed_email: Optional[str] = None
    parsed_phone: Optional[str] = None
    parsed_skills: List[str] = []
    parsed_experience_years: int = 0
    parsed_education: Optional[str] = None
    parsed_current_role: Optional[str] = None
    parsed_achievements: List[str] = []
    created_at: datetime

class StatusHistoryEntry(BaseModel):
    status: str
    changed_at: datetime
    changed_by: Optional[str] = None

class ScreeningResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    screening_id: str
    user_id: str
    resume_id: str
    job_id: str
    candidate_name: Optional[str] = None
    match_score: int  # 0-100
    experience_score: int  # 0-100
    skills_score: int  # 0-100
    keyword_score: int  # 0-100
    summary: str
    strengths: List[str]
    gaps: List[str]
    key_highlights: List[str]
    recommended_action: str  # Interview, Maybe, Reject
    detailed_analysis: str
    status: str = "new"  # new, shortlisted, interviewed, hired, rejected
    status_history: List[StatusHistoryEntry] = []
    created_at: datetime
    updated_at: datetime

class ScreeningRequest(BaseModel):
    job_id: str
    resume_ids: List[str]

class StatusUpdate(BaseModel):
    status: str  # shortlisted, interviewed, hired, rejected

# Helper function to extract text from PDF
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")

# Helper function to extract text from DOCX
def extract_text_from_docx(file_content: bytes) -> str:
    try:
        docx_file = io.BytesIO(file_content)
        doc = docx.Document(docx_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract DOCX text: {str(e)}")

# Enhanced resume parsing with Groq AI
async def parse_resume_with_ai(resume_text: str) -> dict:
    """
    Use Groq AI to extract structured information from resume text
    Returns: dict with name, email, phone, skills, experience, education
    """
    
    # Return mock data if AI is not available
    if not is_ai_available():
        logging.warning("Groq API key not configured - returning mock parsed data")
        return {
            "name": extract_candidate_name_simple(resume_text),
            "email": None,
            "phone": None,
            "skills": ["Python", "JavaScript"],
            "experience_years": 0,
            "education": "Not parsed - AI disabled",
            "current_role": "Not parsed - AI disabled",
            "key_achievements": []
        }
    
    try:
        prompt = f"""You are an expert resume parser. Extract the following information from this resume and return it in JSON format.

RESUME TEXT:
{resume_text}

Extract and return in this exact JSON format:
{{
    "name": "<Full name of the candidate>",
    "email": "<Email address if found, otherwise null>",
    "phone": "<Phone number if found, otherwise null>",
    "skills": ["<skill1>", "<skill2>", "<skill3>"],
    "experience_years": <estimated total years of experience as a number>,
    "education": "<Highest degree or most relevant education>",
    "current_role": "<Most recent job title>",
    "key_achievements": ["<achievement1>", "<achievement2>"]
}}

Rules:
1. Extract exact information from the resume
2. If information is not found, use null for strings and empty array for lists
3. For skills, extract both technical and soft skills
4. Return ONLY valid JSON, no markdown or extra text"""

        response = groq_client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        response_text = response.choices[0].message.content.strip()
        
        # Clean response
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n', '', response_text)
            response_text = re.sub(r'\n```$', '', response_text)
        
        import json
        parsed_data = json.loads(response_text)
        return parsed_data
        
    except Exception as e:
        logging.error(f"AI resume parsing error: {str(e)}")
        # Return basic structure if parsing fails
        return {
            "name": extract_candidate_name_simple(resume_text),
            "email": None,
            "phone": None,
            "skills": [],
            "experience_years": 0,
            "education": None,
            "current_role": None,
            "key_achievements": []
        }

# Helper function to extract candidate name from resume text (fallback)
def extract_candidate_name_simple(resume_text: str) -> Optional[str]:
    # Simple heuristic: first line or first few words often contain the name
    lines = resume_text.strip().split('\n')
    if lines:
        first_line = lines[0].strip()
        # Return first line if it's short (likely a name)
        if len(first_line) < 50 and not any(char.isdigit() for char in first_line):
            return first_line
    return None

# ATS-style screening with Groq AI - STRICT SCORING
async def screen_resume_with_ai(resume_text: str, job_data: dict) -> dict:
    
    # Return mock data if AI is not available
    if not is_ai_available():
        logging.warning("Groq API key not configured - returning mock screening data")
        return {
            "match_score": 75,
            "experience_score": 70,
            "skills_score": 80,
            "keyword_score": 75,
            "summary": "AI screening disabled - Please configure GROQ_API_KEY to enable detailed analysis.",
            "strengths": ["Resume uploaded successfully"],
            "gaps": ["AI not configured - unable to perform detailed analysis"],
            "key_highlights": ["Configure Groq API key for AI-powered screening"],
            "recommended_action": "Maybe",
            "detailed_analysis": "AI features are currently disabled. Add GROQ_API_KEY to enable intelligent resume screening."
        }
    
    try:
        # Build comprehensive prompt for STRICT ATS-style analysis
        prompt = f"""You are an EXCEPTIONALLY STRICT expert ATS (Applicant Tracking System) and senior HR recruiter with 15+ years of experience. Analyze this resume against the job description using VERY STRICT ATS-style evaluation.

JOB DESCRIPTION:
Title: {job_data['title']}
Department: {job_data.get('department', 'N/A')}
Experience Level Required: {job_data['experience_level']}
Employment Type: {job_data['employment_type']}

Description:
{job_data['description']}

REQUIRED QUALIFICATIONS:
{chr(10).join(f"- {req}" for req in job_data.get('requirements', []))}

NICE-TO-HAVE QUALIFICATIONS:
{chr(10).join(f"- {skill}" for skill in job_data.get('nice_to_have', []))}

RESUME:
{resume_text}

⚠️ CRITICAL SCORING GUIDELINES - BE EXTREMELY STRICT:

SCORE DISTRIBUTION (Use the FULL range 0-100):
- 90-100: EXCEPTIONAL candidate - Exceeds ALL requirements significantly, rare top-tier talent
- 80-89: STRONG candidate - Meets ALL requirements + some nice-to-haves, clearly qualified
- 70-79: GOOD candidate - Meets MOST requirements, minor gaps acceptable
- 60-69: ADEQUATE candidate - Meets SOME requirements, noticeable gaps
- 50-59: WEAK candidate - Barely meets minimum, significant concerns
- 40-49: POOR candidate - Many gaps, questionable fit
- 0-39: UNQUALIFIED - Does not meet basic requirements

STRICT EVALUATION RULES:
1. Missing even ONE required qualification should DROP score by 15-20 points
2. Wrong experience level (e.g., Junior applying for Senior) should cap match_score at 60
3. Lack of specific technologies/skills mentioned in JD should DROP skills_score by 10-15 points EACH
4. Generic or weak experience descriptions should be penalized heavily
5. Career gaps or job hopping should reduce experience_score by 10-20 points
6. NO candidate should score 85+ unless they are TRULY EXCEPTIONAL and exceed requirements
7. Average candidates should score 55-70 range
8. Only give 80+ if candidate demonstrably exceeds most requirements with proof

Provide analysis in this JSON format:
{{
    "match_score": <0-100, STRICT overall match - most candidates should be 50-75>,
    "experience_score": <0-100, STRICT experience evaluation>,
    "skills_score": <0-100, STRICT skills match - penalize missing required skills heavily>,
    "keyword_score": <0-100, STRICT keyword density check>,
    "summary": "<2-3 sentence HONEST overview - mention gaps clearly>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
    "key_highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
    "recommended_action": "<Interview|Maybe|Reject>",
    "detailed_analysis": "<HONEST paragraph - be critical, mention gaps and concerns>"
}}

Focus on STRICT evaluation:
1. Count EXACT keyword matches - partial matches don't count
2. Verify experience level EXACTLY matches requirement
3. Check for ALL required skills - missing any? Penalize heavily
4. Evaluate quality of achievements - vague descriptions = low score
5. Check education requirements - missing degree? Penalize

BE CRITICAL. BE STRICT. Most candidates should score 50-75. Only truly exceptional candidates deserve 80+. Return ONLY valid JSON."""

        response = groq_client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2  # Lower temperature for more consistent strict scoring
        )
        response_text = response.choices[0].message.content.strip()
        
        # Extract JSON from response (remove markdown code blocks if present)
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n', '', response_text)
            response_text = re.sub(r'\n```$', '', response_text)
        
        import json
        result = json.loads(response_text)
        
        return result
        
    except Exception as e:
        logging.error(f"AI screening error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI screening failed: {str(e)}")

async def get_user_from_cookie(request: Request) -> Optional[User]:
    # First, try to get session from cookie (legacy)
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    # NEW: Check for X-Session-ID header (session-based, no auth required)
    session_id = request.headers.get("X-Session-ID")
    
    if session_id:
        # Session-based authentication (no login required)
        # Check if user exists for this session
        user_doc = await db.users.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if user_doc:
            return User(**user_doc)
        
        # Create a new user for this session
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        new_user = {
            "user_id": user_id,
            "session_id": session_id,
            "email": f"{user_id}@local.session",
            "name": "Guest User",
            "picture": None,
            "created_at": now,
        }
        
        await db.users.insert_one(new_user)
        return User(**new_user)
    
    # Legacy token-based authentication
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Helper function to check if AI features are available
def is_ai_available():
    return groq_client is not None
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

@api_router.get("/auth/google/login")
async def google_login():
    """Generate Google OAuth authorization URL and return it."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID.")
    
    redirect_uri = f"{FRONTEND_URL}/auth/callback"
    state = uuid.uuid4().hex
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return {"auth_url": auth_url}

@api_router.post("/auth/google/callback")
async def google_callback(request: Request, response: Response):
    """Exchange Google authorization code for tokens and create user session."""
    body = await request.json()
    code = body.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    redirect_uri = f"{FRONTEND_URL}/auth/callback"
    
    try:
        # Exchange authorization code for tokens
        token_response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        
        if token_response.status_code != 200:
            logging.error(f"Google token exchange failed: {token_response.text}")
            raise HTTPException(status_code=401, detail="Failed to exchange authorization code")
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=401, detail="No access token received from Google")
        
        # Fetch user profile from Google
        userinfo_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch user info from Google")
        
        google_user = userinfo_response.json()
        email = google_user.get("email")
        name = google_user.get("name", email)
        picture = google_user.get("picture")
        
        if not email:
            raise HTTPException(status_code=401, detail="Google account has no email")
        
        # Create or update user in database
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        existing_user = await db.users.find_one(
            {"email": email},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": name,
                    "picture": picture,
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc),
            })
        
        # Create session
        session_token = uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
            "google_tokens": {
                "access_token": access_token,
                "refresh_token": token_data.get("refresh_token"),
            },
        })
        
        user_doc = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        # Set the session cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",
        )
        
        return {
            "session_token": session_token,
            "user": user_doc,
        }
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Google OAuth error: {str(e)}")

@api_router.get("/auth/me")
async def get_current_user(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# Job Description Endpoints

@api_router.post("/jobs")
async def create_job(job_data: JobDescriptionCreate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    job_doc = {
        "job_id": job_id,
        "user_id": user.user_id,
        "title": job_data.title,
        "department": job_data.department,
        "location": job_data.location,
        "employment_type": job_data.employment_type,
        "experience_level": job_data.experience_level,
        "description": job_data.description,
        "requirements": job_data.requirements,
        "nice_to_have": job_data.nice_to_have,
        "salary_range": job_data.salary_range.dict() if job_data.salary_range else None,
        "status": job_data.status,
        "created_at": now,
        "updated_at": now
    }
    
    await db.jobs.insert_one(job_doc)
    
    created_job = await db.jobs.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    return created_job

@api_router.get("/jobs")
async def list_jobs(request: Request, status: Optional[str] = None):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job = await db.jobs.find_one(
        {"job_id": job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_data: JobDescriptionUpdate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    job = await db.jobs.find_one(
        {"job_id": job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = {k: v for k, v in job_data.dict(exclude_unset=True).items() if v is not None}
    
    if update_data:
        if "salary_range" in update_data and update_data["salary_range"]:
            update_data["salary_range"] = update_data["salary_range"]
        
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        await db.jobs.update_one(
            {"job_id": job_id},
            {"$set": update_data}
        )
    
    updated_job = await db.jobs.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    return updated_job

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.jobs.delete_one(
        {"job_id": job_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job deleted successfully"}

# Resume Upload Endpoints

@api_router.post("/resumes/upload")
async def upload_resumes(request: Request, files: List[UploadFile] = File(...)):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    uploaded_resumes = []
    
    for file in files:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF and DOCX are supported.")
        
        # Read file content
        file_content = await file.read()
        
        # Validate file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large: {file.filename}. Maximum size is 10MB.")
        
        # Extract text based on file type
        file_type = 'pdf' if file.filename.lower().endswith('.pdf') else 'docx'
        
        if file_type == 'pdf':
            extracted_text = extract_text_from_pdf(file_content)
        else:
            extracted_text = extract_text_from_docx(file_content)
        
        if not extracted_text or len(extracted_text) < 50:
            raise HTTPException(status_code=400, detail=f"Could not extract sufficient text from {file.filename}")
        
        # Parse resume with AI to extract structured data
        parsed_data = await parse_resume_with_ai(extracted_text)
        
        # Encode file content to base64
        file_content_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Create resume record with parsed data
        resume_id = f"resume_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        resume_doc = {
            "resume_id": resume_id,
            "user_id": user.user_id,
            "filename": file.filename,
            "file_content": file_content_base64,
            "file_type": file_type,
            "extracted_text": extracted_text,
            # Parsed data from AI
            "parsed_name": parsed_data.get("name"),
            "parsed_email": parsed_data.get("email"),
            "parsed_phone": parsed_data.get("phone"),
            "parsed_skills": parsed_data.get("skills", []),
            "parsed_experience_years": parsed_data.get("experience_years", 0),
            "parsed_education": parsed_data.get("education"),
            "parsed_current_role": parsed_data.get("current_role"),
            "parsed_achievements": parsed_data.get("key_achievements", []),
            "created_at": now
        }
        
        await db.resumes.insert_one(resume_doc)
        
        uploaded_resumes.append({
            "resume_id": resume_id,
            "filename": file.filename,
            "file_type": file_type,
            "text_length": len(extracted_text),
            "candidate_name": parsed_data.get("name"),
            "skills_count": len(parsed_data.get("skills", [])),
            "experience_years": parsed_data.get("experience_years", 0)
        })
    
    return {
        "message": f"Successfully uploaded {len(uploaded_resumes)} resume(s)",
        "resumes": uploaded_resumes
    }

@api_router.post("/resumes/screen")
async def screen_resumes(request: Request, screening_request: ScreeningRequest):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get job description
    job = await db.jobs.find_one(
        {"job_id": screening_request.job_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    screening_results = []
    
    for resume_id in screening_request.resume_ids:
        # Get resume
        resume = await db.resumes.find_one(
            {"resume_id": resume_id, "user_id": user.user_id},
            {"_id": 0}
        )
        
        if not resume:
            continue  # Skip if resume not found
        
        # Screen resume with AI
        ai_result = await screen_resume_with_ai(resume['extracted_text'], job)
        
        # Use parsed name if available, otherwise extract from text
        candidate_name = resume.get('parsed_name') or extract_candidate_name_simple(resume['extracted_text'])
        
        # Create screening result
        screening_id = f"screening_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        screening_doc = {
            "screening_id": screening_id,
            "user_id": user.user_id,
            "resume_id": resume_id,
            "job_id": screening_request.job_id,
            "candidate_name": candidate_name,
            "match_score": ai_result['match_score'],
            "experience_score": ai_result['experience_score'],
            "skills_score": ai_result['skills_score'],
            "keyword_score": ai_result['keyword_score'],
            "summary": ai_result['summary'],
            "strengths": ai_result['strengths'],
            "gaps": ai_result['gaps'],
            "key_highlights": ai_result['key_highlights'],
            "recommended_action": ai_result['recommended_action'],
            "detailed_analysis": ai_result['detailed_analysis'],
            "status": "new",
            "status_history": [{
                "status": "new",
                "changed_at": now,
                "changed_by": user.user_id
            }],
            "created_at": now,
            "updated_at": now
        }
        
        await db.screenings.insert_one(screening_doc)
        
        screening_results.append({
            "screening_id": screening_id,
            "resume_id": resume_id,
            "filename": resume['filename'],
            "candidate_name": candidate_name,
            "match_score": ai_result['match_score'],
            "recommended_action": ai_result['recommended_action']
        })
    
    return {
        "message": f"Successfully screened {len(screening_results)} resume(s)",
        "results": screening_results
    }

@api_router.get("/screenings")
async def list_screenings(
    request: Request, 
    job_id: Optional[str] = None,
    status: Optional[str] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    
    # Filter by job
    if job_id:
        query["job_id"] = job_id
    
    # Filter by status
    if status:
        query["status"] = status
    
    # Filter by score range
    if min_score is not None or max_score is not None:
        score_query = {}
        if min_score is not None:
            score_query["$gte"] = min_score
        if max_score is not None:
            score_query["$lte"] = max_score
        if score_query:
            query["match_score"] = score_query
    
    # Filter by date range
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if date_query:
            query["created_at"] = date_query
    
    # Search by candidate name
    if search:
        query["candidate_name"] = {"$regex": search, "$options": "i"}
    
    screenings = await db.screenings.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    # Enrich with job and resume info
    for screening in screenings:
        # Get job info
        job = await db.jobs.find_one(
            {"job_id": screening['job_id']},
            {"_id": 0, "title": 1, "department": 1}
        )
        screening['job_title'] = job['title'] if job else "Unknown"
        screening['job_department'] = job.get('department') if job else None
        
        # Get resume info
        resume = await db.resumes.find_one(
            {"resume_id": screening['resume_id']},
            {"_id": 0, "filename": 1}
        )
        screening['filename'] = resume['filename'] if resume else "Unknown"
    
    return screenings

@api_router.get("/screenings/{screening_id}")
async def get_screening(screening_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    screening = await db.screenings.find_one(
        {"screening_id": screening_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    # Get job info
    job = await db.jobs.find_one(
        {"job_id": screening['job_id']},
        {"_id": 0}
    )
    screening['job'] = job
    
    # Get resume info
    resume = await db.resumes.find_one(
        {"resume_id": screening['resume_id']},
        {"_id": 0, "filename": 1, "file_type": 1, "extracted_text": 1}
    )
    screening['resume'] = resume
    
    return screening

@api_router.put("/screenings/{screening_id}/status")
async def update_screening_status(screening_id: str, status_update: StatusUpdate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate status
    valid_statuses = ["new", "shortlisted", "interviewed", "hired", "rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    screening = await db.screenings.find_one(
        {"screening_id": screening_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    now = datetime.now(timezone.utc)
    status_history = screening.get("status_history", [])
    status_history.append({
        "status": status_update.status,
        "changed_at": now,
        "changed_by": user.user_id
    })
    
    await db.screenings.update_one(
        {"screening_id": screening_id},
        {
            "$set": {
                "status": status_update.status,
                "status_history": status_history,
                "updated_at": now
            }
        }
    )
    
    return {"message": "Status updated successfully", "status": status_update.status}

@api_router.post("/screenings/bulk-update-status")
async def bulk_update_status(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    screening_ids = body.get("screening_ids", [])
    new_status = body.get("status")
    
    if not screening_ids or not new_status:
        raise HTTPException(status_code=400, detail="screening_ids and status are required")
    
    valid_statuses = ["new", "shortlisted", "interviewed", "hired", "rejected"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    now = datetime.now(timezone.utc)
    updated_count = 0
    
    for screening_id in screening_ids:
        screening = await db.screenings.find_one(
            {"screening_id": screening_id, "user_id": user.user_id}
        )
        if screening:
            status_history = screening.get("status_history", [])
            status_history.append({
                "status": new_status,
                "changed_at": now,
                "changed_by": user.user_id
            })
            
            await db.screenings.update_one(
                {"screening_id": screening_id},
                {
                    "$set": {
                        "status": new_status,
                        "status_history": status_history,
                        "updated_at": now
                    }
                }
            )
            updated_count += 1
    
    return {"message": f"Updated {updated_count} screening(s)", "count": updated_count}

@api_router.get("/screenings/export/csv")
async def export_screenings_csv(request: Request, job_id: Optional[str] = None, status: Optional[str] = None):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    if job_id:
        query["job_id"] = job_id
    if status:
        query["status"] = status
    
    screenings = await db.screenings.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    
    # Build CSV content
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Screening ID", "Candidate Name", "Job ID", "Match Score", "Experience Score",
        "Skills Score", "Keyword Score", "Recommended Action", "Status", "Summary",
        "Strengths", "Gaps", "Key Highlights", "Created At"
    ])
    
    # Rows
    for screening in screenings:
        writer.writerow([
            screening.get('screening_id', ''),
            screening.get('candidate_name', 'N/A'),
            screening.get('job_id', ''),
            screening.get('match_score', 0),
            screening.get('experience_score', 0),
            screening.get('skills_score', 0),
            screening.get('keyword_score', 0),
            screening.get('recommended_action', ''),
            screening.get('status', 'new'),
            screening.get('summary', ''),
            '; '.join(screening.get('strengths', [])),
            '; '.join(screening.get('gaps', [])),
            '; '.join(screening.get('key_highlights', [])),
            screening.get('created_at', '').isoformat() if screening.get('created_at') else ''
        ])
    
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=screening_results.csv"}
    )

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get all screenings
    all_screenings = await db.screenings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(length=None)
    
    # Status breakdown
    status_counts = {
        "new": 0,
        "shortlisted": 0,
        "interviewed": 0,
        "hired": 0,
        "rejected": 0
    }
    
    for screening in all_screenings:
        status = screening.get('status', 'new')
        if status in status_counts:
            status_counts[status] += 1
    
    # Calculate average scores
    total_match_score = 0
    total_experience_score = 0
    total_skills_score = 0
    total_keyword_score = 0
    count = len(all_screenings)
    
    for screening in all_screenings:
        total_match_score += screening.get('match_score', 0)
        total_experience_score += screening.get('experience_score', 0)
        total_skills_score += screening.get('skills_score', 0)
        total_keyword_score += screening.get('keyword_score', 0)
    
    avg_scores = {
        "match_score": round(total_match_score / count, 1) if count > 0 else 0,
        "experience_score": round(total_experience_score / count, 1) if count > 0 else 0,
        "skills_score": round(total_skills_score / count, 1) if count > 0 else 0,
        "keyword_score": round(total_keyword_score / count, 1) if count > 0 else 0
    }
    
    # Get top performing jobs (by average match score)
    job_scores = {}
    for screening in all_screenings:
        job_id = screening.get('job_id')
        if job_id:
            if job_id not in job_scores:
                job_scores[job_id] = {"total": 0, "count": 0}
            job_scores[job_id]["total"] += screening.get('match_score', 0)
            job_scores[job_id]["count"] += 1
    
    top_jobs = []
    for job_id, data in job_scores.items():
        avg_score = data["total"] / data["count"]
        job = await db.jobs.find_one(
            {"job_id": job_id},
            {"_id": 0, "title": 1}
        )
        if job:
            top_jobs.append({
                "job_id": job_id,
                "job_title": job.get('title', 'Unknown'),
                "avg_match_score": round(avg_score, 1),
                "candidate_count": data["count"]
            })
    
    top_jobs.sort(key=lambda x: x["avg_match_score"], reverse=True)
    top_jobs = top_jobs[:5]  # Top 5 jobs
    
    # Calculate conversion rate (hired / total)
    conversion_rate = round((status_counts["hired"] / count * 100), 1) if count > 0 else 0
    
    return {
        "total_screenings": count,
        "status_breakdown": status_counts,
        "average_scores": avg_scores,
        "top_jobs": top_jobs,
        "conversion_rate": conversion_rate
    }


@api_router.get("/resumes")
async def list_resumes(request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    resumes = await db.resumes.find(
        {"user_id": user.user_id},
        {"_id": 0, "file_content": 0, "extracted_text": 0}  # Exclude large fields
    ).sort("created_at", -1).to_list(length=None)
    
    return resumes

# Calendar Event Models
class CalendarEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    event_type: str = "interview"  # interview, meeting, reminder, other
    start_datetime: datetime
    end_datetime: datetime
    location: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    screening_id: Optional[str] = None
    status: str = "scheduled"  # scheduled, completed, cancelled
    color_tag: Optional[str] = "blue"  # blue, green, purple, orange, red
    created_at: datetime
    updated_at: datetime

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "interview"
    start_datetime: datetime
    end_datetime: datetime
    location: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    screening_id: Optional[str] = None
    status: str = "scheduled"
    color_tag: Optional[str] = "blue"

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    location: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    screening_id: Optional[str] = None
    status: Optional[str] = None
    color_tag: Optional[str] = None

# Calendar Endpoints
@api_router.post("/calendar/events")
async def create_calendar_event(event_data: CalendarEventCreate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    event_id = f"event_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    event_doc = {
        "event_id": event_id,
        "user_id": user.user_id,
        "title": event_data.title,
        "description": event_data.description,
        "event_type": event_data.event_type,
        "start_datetime": event_data.start_datetime,
        "end_datetime": event_data.end_datetime,
        "location": event_data.location,
        "candidate_name": event_data.candidate_name,
        "candidate_email": event_data.candidate_email,
        "screening_id": event_data.screening_id,
        "status": event_data.status,
        "color_tag": event_data.color_tag,
        "created_at": now,
        "updated_at": now
    }
    
    await db.calendar_events.insert_one(event_doc)
    
    created_event = await db.calendar_events.find_one(
        {"event_id": event_id},
        {"_id": 0}
    )
    
    return created_event

@api_router.get("/calendar/events")
async def list_calendar_events(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    event_type: Optional[str] = None,
    status: Optional[str] = None
):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {"user_id": user.user_id}
    
    if event_type:
        query["event_type"] = event_type
    
    if status:
        query["status"] = status
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if date_query:
            query["start_datetime"] = date_query
    
    events = await db.calendar_events.find(query, {"_id": 0}).sort("start_datetime", 1).to_list(length=None)
    
    return events

@api_router.get("/calendar/events/{event_id}")
async def get_calendar_event(event_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    event = await db.calendar_events.find_one(
        {"event_id": event_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event

@api_router.put("/calendar/events/{event_id}")
async def update_calendar_event(event_id: str, event_data: CalendarEventUpdate, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    event = await db.calendar_events.find_one(
        {"event_id": event_id, "user_id": user.user_id}
    )
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {k: v for k, v in event_data.dict(exclude_unset=True).items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await db.calendar_events.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
    
    updated_event = await db.calendar_events.find_one(
        {"event_id": event_id},
        {"_id": 0}
    )
    
    return updated_event

@api_router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.calendar_events.delete_one(
        {"event_id": event_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}

# Email Draft Generator Models
class EmailDraftRequest(BaseModel):
    email_type: str  # interview_invitation, reschedule, offer_letter, rejection, follow_up
    candidate_name: str
    job_title: Optional[str] = None
    company_name: Optional[str] = "Our Company"
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_location: Optional[str] = None
    tone: str = "professional"  # professional, friendly, formal
    additional_details: Optional[str] = None
    hr_name: Optional[str] = None
    hr_email: Optional[str] = None

class EmailDraftResponse(BaseModel):
    subject: str
    body: str
    email_type: str

# Email Draft Generator Endpoint
@api_router.post("/emails/generate-draft")
async def generate_email_draft(draft_request: EmailDraftRequest, request: Request):
    user = await get_user_from_cookie(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # Create prompt based on email type
    hr_info = ""
    if draft_request.hr_name or draft_request.hr_email:
        hr_info = f"\nHR Contact: {draft_request.hr_name or 'HR Team'}"
        if draft_request.hr_email:
            hr_info += f" ({draft_request.hr_email})"
    
    email_templates = {
        "interview_invitation": f"""Generate a professional interview invitation email (300-340 words, 3-4 paragraphs, approximately 80-120 words per paragraph).

Candidate Name: {draft_request.candidate_name}
Job Title: {draft_request.job_title}
Company: {draft_request.company_name}
Interview Date: {draft_request.interview_date or 'TBD'}
Interview Time: {draft_request.interview_time or 'TBD'}
Location: {draft_request.interview_location or 'TBD'}
Tone: {draft_request.tone}
Additional Details: {draft_request.additional_details or 'None'}{hr_info}

IMPORTANT GUIDELINES:
- Keep email concise: 300-340 words total
- Structure: 3-4 paragraphs, each 80-120 words
- DO NOT include any confidential information (no salary, compensation, or benefits details)
- If date/time/location is missing or 'TBD', state "Details will be informed shortly"
- Be warm and professional, not too formal

Email structure:
1. Paragraph 1 (80-100 words): Warm congratulations on moving forward in the hiring process. Brief excitement about their candidacy.

2. Paragraph 2 (90-110 words): Interview logistics - date, time, location (or "Details will be informed shortly" if missing). Mention interview format (virtual/in-person), expected duration (45-60 minutes), and who they'll meet with if known.

3. Paragraph 3 (80-100 words): What to prepare - bring resume copy, be ready to discuss experience and the role, prepare questions. For virtual interviews, mention testing connection beforehand.

4. Paragraph 4 (50-70 words): Closing - encourage questions, express enthusiasm, professional sign-off with HR contact.

Make it human, warm, and professional. Avoid clichés.

Return ONLY valid JSON in this EXACT format with properly escaped characters:
{{
    "subject": "email subject line here",
    "body": "complete email body with \\n for line breaks and HR signature at the end"
}}

Do NOT include any markdown, code blocks, or extra text. ONLY the JSON object.""",
        "reschedule": f"""Generate a professional interview reschedule email (300-340 words, 3-4 paragraphs, approximately 80-120 words per paragraph).

Candidate Name: {draft_request.candidate_name}
Job Title: {draft_request.job_title}
Company: {draft_request.company_name}
New Interview Date: {draft_request.interview_date or 'TBD'}
New Interview Time: {draft_request.interview_time or 'TBD'}
Tone: {draft_request.tone}
Additional Details: {draft_request.additional_details or 'None'}{hr_info}

IMPORTANT GUIDELINES:
- Keep email concise: 300-340 words total
- Structure: 3-4 paragraphs, each 80-120 words
- DO NOT include any confidential information
- If new date/time is missing or 'TBD', state "Updated details will be informed shortly"
- Be warm, empathetic, and professional

Email structure:
1. Paragraph 1 (80-100 words): Apologize for the inconvenience of rescheduling. Brief, professional reason if appropriate (scheduling conflict, interviewer availability). Express continued strong interest in their candidacy.

2. Paragraph 2 (90-110 words): Clearly state the new interview date, time, and location (or "Updated details will be informed shortly" if missing). Confirm that all other aspects of the interview remain the same. Mention interview format and duration.

3. Paragraph 3 (80-100 words): Ask them to confirm their availability for the new time. Offer flexibility if this doesn't work - emphasize willingness to find an alternative. Provide clear instructions for responding.

4. Paragraph 4 (50-70 words): Closing - thank them for their understanding, express enthusiasm about meeting them, professional sign-off with HR contact.

Make it human, warm, and empathetic. Avoid clichés.

Return ONLY valid JSON in this EXACT format with properly escaped characters:
{{
    "subject": "email subject line here",
    "body": "complete email body with \\n for line breaks and HR signature at the end"
}}

Do NOT include any markdown, code blocks, or extra text. ONLY the JSON object.""",
        "offer_letter": f"""Generate a professional job offer email (300-340 words, 3-4 paragraphs, approximately 80-120 words per paragraph).

Candidate Name: {draft_request.candidate_name}
Job Title: {draft_request.job_title}
Company: {draft_request.company_name}
Tone: {draft_request.tone}
Additional Details: {draft_request.additional_details or 'None'}{hr_info}

IMPORTANT GUIDELINES:
- Keep email concise: 300-340 words total
- Structure: 3-4 paragraphs, each 80-120 words
- DO NOT include confidential compensation details (NO salary, benefits, perks, stock options, bonuses)
- If specific details are needed, state "Details will be provided in the formal offer letter"
- Be warm, exciting, and professional

Email structure:
1. Paragraph 1 (80-100 words): Enthusiastic congratulations! Express excitement about extending the offer. Highlight what impressed the team about their candidacy. Make them feel valued and wanted.

2. Paragraph 2 (90-110 words): Formal offer statement for the [Job Title] position. Mention that complete compensation and benefits details will be provided in the formal offer letter document (attached or coming separately). Note employment type (full-time/part-time/contract) and tentative start date if known, or state "Start date details will be discussed".

3. Paragraph 3 (80-100 words): Next steps - mention formal offer letter coming, timeline for their decision (typical 1-2 weeks), onboarding process preview. Encourage questions and offer to schedule a call to discuss any aspects of the offer.

4. Paragraph 4 (50-70 words): Closing - express genuine excitement about them potentially joining the team. Professional sign-off with HR contact.

Make it warm, exciting, and celebratory while remaining professional. This is a significant moment.

Return ONLY valid JSON in this EXACT format with properly escaped characters:
{{
    "subject": "email subject line here",
    "body": "complete email body with \\n for line breaks and HR signature at the end"
}}

Do NOT include any markdown, code blocks, or extra text. ONLY the JSON object.""",
        "rejection": f"""Generate a professional, respectful job rejection email (300-340 words, 3-4 paragraphs, approximately 80-120 words per paragraph).

Candidate Name: {draft_request.candidate_name}
Job Title: {draft_request.job_title}
Company: {draft_request.company_name}
Tone: {draft_request.tone}
Additional Details: {draft_request.additional_details or 'None'}{hr_info}

IMPORTANT GUIDELINES:
- Keep email concise: 300-340 words total
- Structure: 3-4 paragraphs, each 80-120 words
- DO NOT include any confidential information
- Be respectful, empathetic, and encouraging
- Leave a positive impression of the company

Email structure:
1. Paragraph 1 (80-100 words): Thank them sincerely for their time and interest in the position. Acknowledge the effort they put into the interview process. Show genuine appreciation for the opportunity to learn about their background.

2. Paragraph 2 (90-110 words): Deliver the decision clearly but respectfully - we've decided to move forward with another candidate. Provide brief, constructive context: highly competitive process, strong pool of candidates, or specific role requirements. Emphasize this was a difficult decision.

3. Paragraph 3 (80-100 words): Highlight positive aspects of their candidacy - specific skills, experience, or qualities that impressed the team. Encourage them to apply for future openings that match their profile. Keep the door open for potential future opportunities.

4. Paragraph 4 (50-70 words): Closing - wish them success in their job search and career. Express hope to stay connected (LinkedIn, future roles). Professional sign-off with HR contact.

Make it empathetic, respectful, and genuinely encouraging. Leave candidates with a positive impression.

Return ONLY valid JSON in this EXACT format with properly escaped characters:
{{
    "subject": "email subject line here",
    "body": "complete email body with \\n for line breaks and HR signature at the end"
}}

Do NOT include any markdown, code blocks, or extra text. ONLY the JSON object.""",
        "follow_up": f"""Generate a professional follow-up email after interview (300-340 words, 3-4 paragraphs, approximately 80-120 words per paragraph).

Candidate Name: {draft_request.candidate_name}
Job Title: {draft_request.job_title}
Company: {draft_request.company_name}
Tone: {draft_request.tone}
Additional Details: {draft_request.additional_details or 'None'}{hr_info}

IMPORTANT GUIDELINES:
- Keep email concise: 300-340 words total
- Structure: 3-4 paragraphs, each 80-120 words
- DO NOT include any confidential information
- Be warm, reassuring, and professional
- Keep the candidate engaged and informed

Email structure:
1. Paragraph 1 (80-100 words): Thank them for taking the time to interview. Express that it was a pleasure meeting them and learning about their experience. Mention something specific from the interview conversation that stood out positively.

2. Paragraph 2 (90-110 words): Share the team's positive impressions from the interview. Reiterate their qualifications that align well with the role. Make them feel valued and that the interview went well.

3. Paragraph 3 (80-100 words): Provide clear timeline for next steps - when they can expect to hear back. If additional interviews or assessments are needed, mention them. If timeline is uncertain, state "We'll update you on next steps shortly". Emphasize that the team is actively reviewing all candidates.

4. Paragraph 4 (50-70 words): Closing - encourage them to reach out with any questions. Express continued enthusiasm about their candidacy. Professional sign-off with HR contact.

Make it warm, reassuring, and professional. This email should keep candidates engaged and positive.

Return ONLY valid JSON in this EXACT format with properly escaped characters:
{{
    "subject": "email subject line here",
    "body": "complete email body with \\n for line breaks and HR signature at the end"
}}

Do NOT include any markdown, code blocks, or extra text. ONLY the JSON object."""
    }
    
    prompt = email_templates.get(draft_request.email_type)
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Invalid email type")
    
    # Check if AI is available
    if not is_ai_available():
        logging.warning("Groq API key not configured - returning mock email")
        return EmailDraftResponse(
            subject=f"{draft_request.email_type.replace('_', ' ').title()} - {draft_request.job_title or 'Position'}",
            body=f"Dear {draft_request.candidate_name},\n\n⚠️ AI email generation is currently disabled.\n\nTo enable AI-powered email generation:\n1. Get a FREE Groq API key from https://console.groq.com/keys\n2. Add it to your backend .env file as GROQ_API_KEY=your_key_here\n3. Restart the backend server\n\nOnce configured, intelligent personalized emails will be generated automatically.\n\nBest regards,\n{draft_request.hr_name or 'HR Team'}\n{draft_request.hr_email or ''}",
            email_type=draft_request.email_type
        )
    
    try:
        system_prompt = """You are an AI email assistant for HRAI, an enterprise HR intelligence platform.

Your task is to generate professional, clear, and context-aware hiring emails based on the provided candidate data and selected email type.

The email must be:
- Polished and professional
- Detailed and neat, with no unnecessary content
- Human-sounding and natural (not robotic or using generic AI phrases)
- Free of clichés like "I hope this email finds you well" or "We appreciate your interest"
- Structured properly with a clear Subject line and Body
- Ready to send immediately without further editing
- Use specific details provided (dates, times, names, locations)
- Written in a warm yet professional corporate tone
- Include proper spacing and paragraphs for readability"""

        response = groq_client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        response_text = response.choices[0].message.content.strip()
        
        # Extract and clean JSON from response
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        # Clean control characters more aggressively
        # Remove all control characters except newlines and tabs
        response_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', response_text)
        
        # Normalize line endings
        response_text = response_text.replace('\r\n', '\n').replace('\r', '\n')
        
        # Fix common JSON escaping issues
        response_text = response_text.replace('\\\\', '\\')  # Fix double backslashes
        
        # Try to parse JSON with error handling
        import json
        try:
            email_data = json.loads(response_text)
        except json.JSONDecodeError as je:
            logging.error(f"JSON decode error: {str(je)}")
            logging.error(f"Response text: {response_text[:500]}")
            
            # Try to extract subject and body manually if JSON parsing fails
            try:
                # More robust regex patterns for extracting JSON fields
                subject_match = re.search(r'"subject"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,', response_text, re.DOTALL)
                body_match = re.search(r'"body"\s*:\s*"((?:[^"\\]|\\.)*)"', response_text, re.DOTALL)
                
                if subject_match and body_match:
                    subject_raw = subject_match.group(1)
                    body_raw = body_match.group(1)
                    
                    # Unescape the strings properly
                    email_data = {
                        "subject": subject_raw.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t'),
                        "body": body_raw.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')
                    }
                else:
                    # Last resort: try to find any text that looks like email content
                    logging.error("Could not extract structured data, attempting fallback")
                    raise HTTPException(status_code=500, detail="Could not parse AI response - invalid format")
            except HTTPException:
                raise
            except Exception as parse_error:
                logging.error(f"Manual parsing error: {str(parse_error)}")
                raise HTTPException(status_code=500, detail=f"Failed to parse email content: {str(je)}")
        
        return {
            "subject": email_data.get("subject", ""),
            "body": email_data.get("body", ""),
            "email_type": draft_request.email_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Email generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate email: {str(e)}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
