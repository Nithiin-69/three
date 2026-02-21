import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, RefreshCw, Plus, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import LottieLoader from '../components/LottieLoader';

const ScreeningPrime = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showNewJDForm, setShowNewJDForm] = useState(false);
  const [newJD, setNewJD] = useState({ title: '', description: '', requirements: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      setError(null);
      const response = await apiClient.get('/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError('Unable to load jobs. Please check your connection.');
      setJobs([]);
    } finally {
      setLoadingJobs(false);
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
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) added`);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadedResumes(response.data.resumes || []);
      toast.success(response.data.message || `${response.data.resumes?.length || 0} resumes uploaded successfully`);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload resumes. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const createNewJob = async () => {
    if (!newJD.title || !newJD.description) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      const response = await apiClient.post('/jobs', {
        ...newJD,
        status: 'active'
      });
      
      setJobs([...jobs, response.data]);
      setSelectedJob(response.data._id);
      setShowNewJDForm(false);
      setNewJD({ title: '', description: '', requirements: '' });
      toast.success('Job description created successfully!');
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job description');
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

      setScreeningResults(response.data.results || []);
      toast.success(response.data.message || 'Screening completed successfully!');
      
      setTimeout(() => {
        navigate('/candidates');
      }, 2000);
    } catch (error) {
      console.error('Screening error:', error);
      toast.error(error.response?.data?.detail || 'Screening failed. Please try again.');
      setIsScreening(false);
    }
  };

  const resetFlow = () => {
    setUploadedFiles([]);
    setUploadedResumes([]);
    setSelectedJob('');
    setScreeningResults([]);
    setShowNewJDForm(false);
  };

  if (loadingJobs) {
    return (
      <PrimeLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <LottieLoader />
          <p className="mt-4 text-foreground-secondary">Loading jobs...</p>
        </div>
      </PrimeLayout>
    );
  }

  return (
    <PrimeLayout>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 frosted-panel border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Screening</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                {uploadedResumes.length === 0 
                  ? "Upload resumes. All of them. We've seen worse."
                  : `${uploadedResumes.length} resume${uploadedResumes.length > 1 ? 's' : ''} ready for screening`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadJobs}
                className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              {(uploadedResumes.length > 0 || selectedJob) && (
                <button
                  onClick={resetFlow}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Upload Resumes */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Step 1: Upload Resumes</h2>
                {uploadedResumes.length > 0 && (
                  <span className="capsule-status border bg-success/10 text-success border-success/20">
                    <CheckCircle className="w-4 h-4" />
                    {uploadedResumes.length} uploaded
                  </span>
                )}
              </div>
              
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-elevated/50'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div>
                    <p className="text-xl font-bold text-foreground mb-2">
                      Drag and Drop files here
                    </p>
                    <p className="text-sm text-foreground-secondary mb-4">OR</p>
                    
                    <label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <PrimeButton as="span">
                        <Upload className="w-4 h-4" />
                        Browse Files
                      </PrimeButton>
                    </label>
                  </div>
                  
                  <p className="text-sm text-foreground-secondary">
                    <strong>Supported:</strong> PDF, DOCX
                  </p>
                </div>
              </div>

              {/* Selected Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Selected ({uploadedFiles.length})
                    </h3>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-sm text-danger hover:text-danger/80"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-2xl bg-elevated border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-foreground-secondary">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFile(index)}
                          className="p-2 hover:bg-surface rounded-full transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <PrimeButton onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Resumes'}
                    </PrimeButton>
                  </div>
                </div>
              )}

              {/* Uploaded Success */}
              {uploadedResumes.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-success/10 border border-success/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-2">
                        {uploadedResumes.length} resume{uploadedResumes.length > 1 ? 's' : ''} ready
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedResumes.slice(0, 5).map((resume, index) => (
                          <span key={index} className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                            {resume.filename}
                          </span>
                        ))}
                        {uploadedResumes.length > 5 && (
                          <span className="text-xs text-success">+{uploadedResumes.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select or Create JD */}
            {uploadedResumes.length > 0 && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Step 2: Select Job Description</h2>
                  {selectedJob && (
                    <span className="capsule-status border bg-primary/10 text-primary border-primary/20">
                      <CheckCircle className="w-4 h-4" />
                      JD selected
                    </span>
                  )}
                </div>
                
                {jobs.length === 0 && !showNewJDForm ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                    <p className="text-foreground-secondary mb-4">No active jobs found</p>
                    <PrimeButton onClick={() => setShowNewJDForm(true)}>
                      <Plus className="w-4 h-4" />
                      Create Job Description
                    </PrimeButton>
                  </div>
                ) : (
                  <>
                    {!showNewJDForm && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {jobs.map((job) => (
                            <button
                              key={job._id}
                              onClick={() => setSelectedJob(job._id)}
                              className={`
                                p-4 rounded-2xl text-left transition-all duration-200 border-2
                                ${selectedJob === job._id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border bg-elevated hover:border-primary/30'
                                }
                              `}
                            >
                              <div className="flex items-start gap-3">
                                <Briefcase className={`w-5 h-5 mt-1 flex-shrink-0 ${selectedJob === job._id ? 'text-primary' : 'text-foreground-secondary'}`} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground mb-1 truncate">{job.title}</h3>
                                  <p className="text-sm text-foreground-secondary line-clamp-2">
                                    {job.description}
                                  </p>
                                </div>
                                {selectedJob === job._id && (
                                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setShowNewJDForm(true)}
                          className="w-full p-4 rounded-2xl border-2 border-dashed border-border bg-elevated hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5 text-primary" />
                          <span className="font-medium text-foreground">Create New Job Description</span>
                        </button>
                      </>
                    )}
                    
                    {showNewJDForm && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">Create New JD</h3>
                          <button
                            onClick={() => setShowNewJDForm(false)}
                            className="text-sm text-foreground-secondary hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={newJD.title}
                          onChange={(e) => setNewJD({ ...newJD, title: e.target.value })}
                          placeholder="Job Title (e.g., Senior Full Stack Developer)"
                          className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                        />
                        
                        <textarea
                          value={newJD.description}
                          onChange={(e) => setNewJD({ ...newJD, description: e.target.value })}
                          placeholder="Job Description"
                          rows={4}
                          className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none resize-none"
                        />
                        
                        <textarea
                          value={newJD.requirements}
                          onChange={(e) => setNewJD({ ...newJD, requirements: e.target.value })}
                          placeholder="Requirements (optional)"
                          rows={3}
                          className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none resize-none"
                        />
                        
                        <PrimeButton onClick={createNewJob}>
                          <Plus className="w-4 h-4" />
                          Create & Select
                        </PrimeButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 3: Screen */}
            {uploadedResumes.length > 0 && selectedJob && !showNewJDForm && (
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Step 3: Start Screening</h2>
                
                {!isScreening && screeningResults.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-foreground mb-2">
                      Ready to screen {uploadedResumes.length} resume{uploadedResumes.length > 1 ? 's' : ''} against "
                      {jobs.find(j => j._id === selectedJob)?.title}"
                    </p>
                    <p className="text-sm text-foreground-secondary mb-6">
                      Screening {uploadedResumes.length} applicants so you don't have to. You're welcome.
                    </p>
                    <PrimeButton onClick={handleScreen}>
                      <CheckCircle className="w-4 h-4" />
                      Start Screening
                    </PrimeButton>
                  </div>
                )}
                
                {isScreening && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LottieLoader />
                    <p className="text-foreground-secondary mt-6 text-center">
                      Screening in progress...<br/>
                      The unqualified are being gently redirected to their destinies.
                    </p>
                  </div>
                )}
                
                {!isScreening && screeningResults.length > 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Screening Complete!</h3>
                    <p className="text-foreground-secondary mb-4">
                      Your shortlist is ready. Redirecting to candidates page...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PrimeLayout>
  );
};

export default ScreeningPrime;
