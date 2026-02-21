import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';




const Screening = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Load persisted screening session on mount
  useEffect(() => {
    loadJobs();
    loadPersistedScreeningSession();
  }, []);

  const loadPersistedScreeningSession = () => {
    try {
      const savedSession = sessionStorage.getItem('screening_session');
      if (savedSession) {
        const { resumes, jobId } = JSON.parse(savedSession);
        if (resumes && resumes.length > 0) {
          setUploadedResumes(resumes);
        }
        if (jobId) {
          setSelectedJob(jobId);
        }
      }
    } catch (error) {
      console.error('Failed to load screening session:', error);
    }
  };

  const persistScreeningSession = useCallback(() => {
    try {
      sessionStorage.setItem('screening_session', JSON.stringify({
        resumes: uploadedResumes,
        jobId: selectedJob
      }));
    } catch (error) {
      console.error('Failed to persist screening session:', error);
    }
  }, [uploadedResumes, selectedJob]);

  // Persist screening session whenever it changes
  useEffect(() => {
    if (uploadedResumes.length > 0 || selectedJob) {
      persistScreeningSession();
    }
  }, [uploadedResumes, selectedJob, persistScreeningSession]);

  const clearScreeningSession = () => {
    sessionStorage.removeItem('screening_session');
    setUploadedResumes([]);
    setSelectedJob('');
    setUploadedFiles([]);
  };

  const loadJobs = async () => {
    try {
      // Load active jobs
      const jobsResponse = await apiClient.get('/jobs?status=active');
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')
    );
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only PDF and DOCX files are supported.');
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedResume = (index) => {
    setUploadedResumes(prev => prev.filter((_, i) => i !== index));
    toast.info('Resume removed from session');
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one resume file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await apiClient.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setUploadedResumes(response.data.resumes);
      toast.success(response.data.message);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload resumes');
    } finally {
      setIsUploading(false);
    }
  };

  const handleScreen = async () => {
    if (!selectedJob) {
      toast.error('Please select a job description');
      return;
    }

    if (uploadedResumes.length === 0) {
      toast.error('Please upload resumes first');
      return;
    }

    setIsScreening(true);

    try {
      const response = await apiClient.post('/resumes/screen', {
          job_id: selectedJob,
          resume_ids: uploadedResumes.map(r => r.resume_id)
        });

      setScreeningResults(response.data.results);
      toast.success(response.data.message);
      
      // Clear screening session after successful screening
      clearScreeningSession();
      
      // Navigate to history to see results
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (error) {
      console.error('Screening error:', error);
      toast.error(error.response?.data?.detail || 'Failed to screen resumes');
    } finally {
      setIsScreening(false);
    }
  };

  const handleCancelScreening = () => {
    if (uploadedResumes.length > 0 || selectedJob) {
      if (window.confirm('Are you sure you want to cancel? All uploaded resumes and selections will be cleared.')) {
        clearScreeningSession();
        toast.success('Screening session cleared');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <nav className="glass-nav sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="relative group">
                  <div className="w-11 h-11 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2 transition-all duration-300 group-hover:shadow-depth-3 group-hover:scale-105">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl gradient-ios-blue opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
                </div>
                <span className="text-2xl font-bold tracking-tightest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  AIRecruiter
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/jobs')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Jobs
                </Button>
                <Button 
                  variant="ghost"
                  className="text-foreground font-medium"
                >
                  Screen Resumes
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/history')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  History
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/calendar')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Calendar
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/emails')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Email Drafts
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Screen Resumes</h1>
            <p className="text-lg text-muted-foreground">Upload resumes and let AI evaluate candidates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Upload Resumes</CardTitle>
                  <CardDescription>Upload one or multiple resume files (PDF or DOCX)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drag & drop resume files here</p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Browse Files</span>
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-4">Supports PDF and DOCX (max 10MB each)</p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-medium mb-3">Selected Files ({uploadedFiles.length})</p>
                      <AnimatePresence>
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <XCircle className="w-5 h-5 text-destructive" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full mt-4 ai-gradient text-white"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {uploadedFiles.length} Resume{uploadedFiles.length > 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Uploaded Resumes Status */}
                  {uploadedResumes.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              {uploadedResumes.length} resume{uploadedResumes.length > 1 ? 's' : ''} ready for screening
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelScreening}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Clear All
                            </Button>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {uploadedResumes.map((resume, idx) => (
                              <li key={idx} className="text-xs text-green-700 dark:text-green-300 flex items-center justify-between group">
                                <span>• {resume.filename} {resume.candidate_name ? `(${resume.candidate_name})` : ''}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUploadedResume(idx)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                                >
                                  <XCircle className="w-3 h-3 text-red-500" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 italic">
                            ✓ Session persisted - you can navigate away and come back
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Job Selection & Screening */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Select Job</CardTitle>
                  <CardDescription>Choose which position to screen for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job description" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No active jobs found
                        </div>
                      ) : (
                        jobs.map(job => (
                          <SelectItem key={job.job_id} value={job.job_id}>
                            {job.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {jobs.length === 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/jobs')}
                    >
                      Create Job Description
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Start Screening</CardTitle>
                  <CardDescription>AI will analyze all uploaded resumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleScreen}
                    disabled={!selectedJob || uploadedResumes.length === 0 || isScreening}
                    className="w-full ai-gradient text-white"
                    size="lg"
                  >
                    {isScreening ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Screening...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Screen {uploadedResumes.length} Resume{uploadedResumes.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>

                  {isScreening && (
                    <div className="mt-4">
                      <Progress value={33} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        AI is analyzing resumes...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-secondary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">ATS-Style Analysis</p>
                      <p>Our AI uses keyword matching, experience evaluation, and skills assessment to provide comprehensive candidate scoring.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Screening;
