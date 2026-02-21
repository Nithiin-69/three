#!/usr/bin/env python3
"""
Backend API Testing for HR Intelligence Dashboard
Testing Groq AI integrations after library upgrade from 0.11.0 to 1.0.0
"""

import requests
import json
import uuid
from datetime import datetime, timezone
import io
from typing import Dict, Any

# Configuration
BASE_URL = "https://hr-dashboard-132.preview.emergentagent.com/api"
SESSION_ID = f"test-session-{uuid.uuid4()}"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "X-Session-ID": SESSION_ID,
            "Content-Type": "application/json"
        })
        self.test_data = {}
        self.results = []
    
    def log_result(self, test_name: str, success: bool, response_data: Any = None, error: str = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "response_data": response_data,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if error:
            print(f"       Error: {error}")
        if response_data and isinstance(response_data, dict):
            print(f"       Data: {json.dumps(response_data, indent=2)}")
    
    def test_job_creation_api(self):
        """Test Priority 1: Job Creation API - POST /api/jobs"""
        print("\n🎯 Testing Job Creation API...")
        
        job_data = {
            "title": "Senior Software Engineer",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "description": "We are looking for a senior software engineer to join our team. The role involves designing and implementing scalable backend systems using Python, FastAPI, and MongoDB.",
            "requirements": [
                "5+ years of Python development experience",
                "Experience with FastAPI or similar web frameworks",
                "Strong knowledge of MongoDB and NoSQL databases",
                "Experience with RESTful API design",
                "Understanding of cloud platforms (AWS, GCP, Azure)"
            ],
            "nice_to_have": [
                "Experience with Docker and Kubernetes",
                "Knowledge of GraphQL",
                "Machine learning background"
            ],
            "salary_range": {
                "min": 120000,
                "max": 180000,
                "currency": "USD"
            },
            "status": "active"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/jobs", json=job_data)
            
            if response.status_code == 200:
                data = response.json()
                if "job_id" in data and data["title"] == job_data["title"]:
                    self.test_data["job_id"] = data["job_id"]
                    self.log_result("Job Creation API", True, {
                        "job_id": data["job_id"],
                        "title": data["title"],
                        "status": data["status"]
                    })
                    return True
                else:
                    self.log_result("Job Creation API", False, error="Invalid response format")
                    return False
            else:
                self.log_result("Job Creation API", False, error=f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Job Creation API", False, error=str(e))
            return False
    
    def test_email_generation_api(self):
        """Test Priority 2: Email Generation API with Groq AI"""
        print("\n🎯 Testing Email Generation API (Groq AI)...")
        
        email_requests = [
            {
                "name": "Interview Invitation Email",
                "data": {
                    "email_type": "interview_invitation",
                    "candidate_name": "Sarah Johnson",
                    "job_title": "Senior Software Engineer",
                    "company_name": "TechCorp Inc",
                    "interview_date": "2024-01-15",
                    "interview_time": "10:00 AM EST",
                    "interview_location": "Virtual - Google Meet",
                    "tone": "professional",
                    "additional_details": "Please prepare for technical coding questions"
                }
            },
            {
                "name": "Job Offer Email",
                "data": {
                    "email_type": "offer_letter",
                    "candidate_name": "Michael Chen",
                    "job_title": "Senior Software Engineer",
                    "company_name": "TechCorp Inc",
                    "tone": "friendly",
                    "additional_details": "Starting salary: $150,000 annually"
                }
            }
        ]
        
        success_count = 0
        
        for email_req in email_requests:
            try:
                response = self.session.post(f"{BASE_URL}/emails/generate-draft", json=email_req["data"])
                
                if response.status_code == 200:
                    data = response.json()
                    if all(key in data for key in ["subject", "body", "email_type"]):
                        if len(data["subject"]) > 5 and len(data["body"]) > 50:
                            self.log_result(f"Email Generation - {email_req['name']}", True, {
                                "email_type": data["email_type"],
                                "subject_length": len(data["subject"]),
                                "body_length": len(data["body"]),
                                "subject": data["subject"][:100] + "..." if len(data["subject"]) > 100 else data["subject"]
                            })
                            success_count += 1
                        else:
                            self.log_result(f"Email Generation - {email_req['name']}", False, error="Generated content too short")
                    else:
                        self.log_result(f"Email Generation - {email_req['name']}", False, error="Missing required fields in response")
                else:
                    self.log_result(f"Email Generation - {email_req['name']}", False, error=f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result(f"Email Generation - {email_req['name']}", False, error=str(e))
        
        return success_count == len(email_requests)
    
    def create_test_resume(self) -> bytes:
        """Create a simple test resume in text format"""
        resume_content = """
SARAH JOHNSON
Software Engineer
Email: sarah.johnson@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Engineer | TechCorp (2020-2024)
- Developed scalable backend systems using Python and FastAPI
- Implemented microservices architecture serving 1M+ users
- Led team of 5 engineers on critical product features
- Reduced API response time by 40% through optimization

Software Engineer | StartupXYZ (2018-2020)
- Built REST APIs using Django and PostgreSQL
- Implemented CI/CD pipelines using Jenkins and Docker
- Collaborated with frontend team on React applications
- Mentored junior developers

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)
GPA: 3.8/4.0

SKILLS
Programming Languages: Python, JavaScript, Java, Go
Frameworks: FastAPI, Django, Flask, React, Node.js
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS, GCP, Docker, Kubernetes
Tools: Git, Jenkins, Jira, Slack

ACHIEVEMENTS
- AWS Certified Solutions Architect
- Published 3 technical papers on distributed systems
- Contributed to open-source projects with 1000+ stars
- Led successful migration of legacy systems to microservices
        """.strip()
        
        return resume_content.encode('utf-8')
    
    def test_resume_upload_and_parsing(self):
        """Test Priority 3: Resume Upload & Parsing with Groq AI"""
        print("\n🎯 Testing Resume Upload & AI Parsing (Groq AI)...")
        
        # Create test resume file
        resume_content = self.create_test_resume()
        
        try:
            # Prepare multipart form data
            files = {
                'files': ('sarah_johnson_resume.txt', resume_content, 'text/plain')
            }
            
            # Remove Content-Type header for multipart request
            headers = {"X-Session-ID": SESSION_ID}
            
            response = requests.post(f"{BASE_URL}/resumes/upload", files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "resumes" in data and len(data["resumes"]) > 0:
                    resume_info = data["resumes"][0]
                    
                    # Store resume ID for later tests
                    if "resume_id" in resume_info:
                        self.test_data["resume_id"] = resume_info["resume_id"]
                    
                    # Check if AI parsing worked
                    required_fields = ["resume_id", "filename", "candidate_name", "skills_count", "experience_years"]
                    if all(field in resume_info for field in required_fields):
                        # Validate AI extracted meaningful data
                        if (resume_info["candidate_name"] and 
                            resume_info["skills_count"] > 0 and 
                            resume_info["experience_years"] > 0):
                            
                            self.log_result("Resume Upload & AI Parsing", True, {
                                "resume_id": resume_info["resume_id"],
                                "candidate_name": resume_info["candidate_name"],
                                "skills_count": resume_info["skills_count"],
                                "experience_years": resume_info["experience_years"],
                                "filename": resume_info["filename"]
                            })
                            return True
                        else:
                            self.log_result("Resume Upload & AI Parsing", False, error="AI failed to extract meaningful data")
                    else:
                        self.log_result("Resume Upload & AI Parsing", False, error="Missing required fields in response")
                else:
                    self.log_result("Resume Upload & AI Parsing", False, error="No resumes in response")
            else:
                self.log_result("Resume Upload & AI Parsing", False, error=f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Resume Upload & AI Parsing", False, error=str(e))
            
        return False
    
    def test_ats_screening_with_ai(self):
        """Test Priority 4: ATS Screening with Groq AI"""
        print("\n🎯 Testing ATS Screening with AI (Groq AI)...")
        
        # Need job_id and resume_id from previous tests
        if "job_id" not in self.test_data or "resume_id" not in self.test_data:
            self.log_result("ATS Screening with AI", False, error="Missing job_id or resume_id from previous tests")
            return False
        
        screening_request = {
            "job_id": self.test_data["job_id"],
            "resume_ids": [self.test_data["resume_id"]]
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/resumes/screen", json=screening_request)
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    result = data["results"][0]
                    
                    # Check all required AI screening fields
                    required_fields = ["screening_id", "resume_id", "candidate_name", "match_score", "recommended_action"]
                    if all(field in result for field in required_fields):
                        # Validate AI scoring logic
                        if (0 <= result["match_score"] <= 100 and 
                            result["recommended_action"] in ["Interview", "Maybe", "Reject"] and
                            result["candidate_name"]):
                            
                            # Store screening_id for potential future tests
                            self.test_data["screening_id"] = result["screening_id"]
                            
                            self.log_result("ATS Screening with AI", True, {
                                "screening_id": result["screening_id"],
                                "candidate_name": result["candidate_name"],
                                "match_score": result["match_score"],
                                "recommended_action": result["recommended_action"],
                                "resume_id": result["resume_id"]
                            })
                            return True
                        else:
                            self.log_result("ATS Screening with AI", False, error="Invalid AI scoring results")
                    else:
                        self.log_result("ATS Screening with AI", False, error="Missing required fields in screening result")
                else:
                    self.log_result("ATS Screening with AI", False, error="No screening results returned")
            else:
                self.log_result("ATS Screening with AI", False, error=f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("ATS Screening with AI", False, error=str(e))
            
        return False
    
    def test_additional_apis(self):
        """Test additional APIs for completeness"""
        print("\n🎯 Testing Additional APIs...")
        
        # Test Get Jobs
        try:
            response = self.session.get(f"{BASE_URL}/jobs")
            if response.status_code == 200:
                jobs = response.json()
                self.log_result("Get Jobs API", True, {"job_count": len(jobs)})
            else:
                self.log_result("Get Jobs API", False, error=f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Get Jobs API", False, error=str(e))
        
        # Test Analytics Dashboard
        try:
            response = self.session.get(f"{BASE_URL}/analytics/dashboard")
            if response.status_code == 200:
                analytics = response.json()
                required_fields = ["total_screenings", "status_breakdown", "average_scores"]
                if all(field in analytics for field in required_fields):
                    self.log_result("Analytics Dashboard API", True, {
                        "total_screenings": analytics["total_screenings"],
                        "conversion_rate": analytics.get("conversion_rate", 0)
                    })
                else:
                    self.log_result("Analytics Dashboard API", False, error="Missing required analytics fields")
            else:
                self.log_result("Analytics Dashboard API", False, error=f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Analytics Dashboard API", False, error=str(e))
    
    def run_all_tests(self):
        """Run all backend tests in priority order"""
        print(f"🚀 Starting Backend API Tests for HR Intelligence Dashboard")
        print(f"📍 Backend URL: {BASE_URL}")
        print(f"🔑 Session ID: {SESSION_ID}")
        print(f"⏰ Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Priority tests as requested
        test1_success = self.test_job_creation_api()
        test2_success = self.test_email_generation_api()
        test3_success = self.test_resume_upload_and_parsing()
        test4_success = self.test_ats_screening_with_ai()
        
        # Additional API tests
        self.test_additional_apis()
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical tests status
        critical_tests = {
            "Job Creation API": test1_success,
            "Email Generation with Groq AI": test2_success,
            "Resume Upload & AI Parsing": test3_success,
            "ATS Screening with AI": test4_success
        }
        
        print(f"\n🎯 CRITICAL TESTS STATUS:")
        for test_name, success in critical_tests.items():
            status = "✅ WORKING" if success else "❌ FAILING"
            print(f"   {test_name}: {status}")
        
        # Failed tests details
        failed_tests_list = [r for r in self.results if not r["success"]]
        if failed_tests_list:
            print(f"\n❌ FAILED TESTS DETAILS:")
            for test in failed_tests_list:
                print(f"   • {test['test']}: {test['error']}")
        
        print(f"\n⏰ Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "critical_tests_status": critical_tests,
            "all_critical_working": all(critical_tests.values())
        }

if __name__ == "__main__":
    tester = BackendTester()
    summary = tester.run_all_tests()
    
    # Exit code based on results
    exit_code = 0 if summary["all_critical_working"] else 1
    exit(exit_code)