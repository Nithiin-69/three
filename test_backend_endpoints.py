#!/usr/bin/env python3
"""Test backend endpoints to identify issues"""
import requests
import json

BASE_URL = "http://localhost:8001/api"
SESSION_ID = "test-session-123"

headers = {
    "X-Session-ID": SESSION_ID,
    "Content-Type": "application/json"
}

def test_endpoint(method, path, data=None, desc=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{path}"
    print(f"\n{'='*60}")
    print(f"Testing: {desc}")
    print(f"{method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        else:
            print(f"Unknown method: {method}")
            return
        
        print(f"Status: {response.status_code}")
        if response.status_code < 300:
            print("✅ SUCCESS")
            try:
                print(f"Response: {json.dumps(response.json(), indent=2)[:500]}")
            except:
                print(f"Response: {response.text[:500]}")
        else:
            print("❌ FAILED")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")

# Test 1: Get user info
test_endpoint("GET", "/auth/me", desc="Get User Info")

# Test 2: Create a job description
job_data = {
    "title": "Senior Python Developer",
    "department": "Engineering",
    "location": "Remote",
    "employment_type": "Full-time",
    "experience_level": "Senior",
    "description": "We are looking for an experienced Python developer",
    "requirements": ["Python", "FastAPI", "MongoDB"],
    "nice_to_have": ["React", "Docker"],
    "status": "active"
}
test_endpoint("POST", "/jobs", data=job_data, desc="Create Job Description")

# Test 3: Get jobs
test_endpoint("GET", "/jobs", desc="Get All Jobs")

# Test 4: Email generation test
email_data = {
    "email_type": "interview_invitation",
    "candidate_name": "John Doe",
    "job_title": "Senior Python Developer",
    "company_name": "Test Company",
    "interview_date": "2025-02-20",
    "interview_time": "14:00",
    "interview_location": "Office",
    "tone": "professional"
}
test_endpoint("POST", "/emails/generate-draft", data=email_data, desc="Generate Email Draft")

print(f"\n{'='*60}")
print("Testing completed!")
