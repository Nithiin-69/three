import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, RefreshCw, Home, Sparkles, CheckCircle, ArrowLeft, Building2, User, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import GenerateButton from '../components/styled/GenerateButton';
import Loader from '../components/styled/Loader';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const EmailDrafts = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [formData, setFormData] = useState({
    email_type: 'interview_invitation',
    candidate_name: '',
    job_id: '',
    job_title: '',
    company_name: 'Our Company',
    interview_date: '',
    interview_time: '',
    interview_location: '',
    tone: 'professional',
    additional_details: '',
    // HR Details
    hr_name: '',
    hr_email: '',
    hr_phone: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  // Check if form is valid for submission
  const isFormValid = formData.candidate_name.trim().length > 0 && formData.job_title.trim().length > 0;

  const fetchJobs = async () => {
    try {
      const response = await apiClient.get('/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const emailTypeLabels = {
    interview_invitation: 'Interview Invitation',
    reschedule: 'Interview Reschedule',
    offer_letter: 'Job Offer Letter',
    rejection: 'Rejection Notice',
    follow_up: 'Follow-up After Interview'
  };

  const handleJobSelect = (jobId) => {
    const selectedJob = jobs.find(job => job.job_id === jobId);
    if (selectedJob) {
      setFormData(prev => ({
        ...prev,
        job_id: jobId,
        job_title: selectedJob.title
      }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.candidate_name) {
      toast.error('Please enter candidate name');
      return;
    }
    if (!formData.job_title) {
      toast.error('Please select a job role');
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null);

    // Minimum 5 second loading animation
    const startTime = Date.now();

    try {
      const response = await apiClient.post('/emails/generate-draft', formData);
      
      // Calculate remaining time to reach 5 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);
      
      // Wait for remaining time before showing result
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setGeneratedEmail(response.data);
      toast.success('Email draft generated successfully!');
    } catch (error) {
      console.error('Failed to generate email:', error);
      
      // Still wait for 5 seconds minimum even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      toast.error('Failed to generate email draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    
    const emailText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(emailText);
    toast.success('Copied to clipboard!');
  };

  const handleReset = () => {
    setGeneratedEmail(null);
    setFormData({
      email_type: 'interview_invitation',
      candidate_name: '',
      job_id: '',
      job_title: '',
      company_name: 'Our Company',
      interview_date: '',
      interview_time: '',
      interview_location: '',
      tone: 'professional',
      additional_details: '',
      hr_name: '',
      hr_email: '',
      hr_phone: ''
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh-ios opacity-20 pointer-events-none" />

      {/* Navigation */}
      <motion.nav 
        className="glass-nav sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-11 h-11 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tightest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  AIRecruiter
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="ios-button-ghost"
              >
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 ios-button-ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-3">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tightest">Email Draft Generator</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Generate professional emails without the passive-aggressive undertones
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Email Details</h2>

              {/* Email Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold mb-2 block">Email Type</Label>
                <Select
                  value={formData.email_type}
                  onValueChange={(value) => setFormData({ ...formData, email_type: value })}
                >
                  <SelectTrigger className="ios-input h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(emailTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HR Details Section */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-primary" />
                  HR Representative Details
                </h3>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold mb-2 block">HR Name</Label>
                  <Input
                    placeholder="John Smith"
                    value={formData.hr_name}
                    onChange={(e) => setFormData({ ...formData, hr_name: e.target.value })}
                    className="ios-input h-12 text-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold mb-2 block">HR Email</Label>
                  <Input
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.hr_email}
                    onChange={(e) => setFormData({ ...formData, hr_email: e.target.value })}
                    className="ios-input h-12 text-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold mb-2 block">HR Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.hr_phone}
                    onChange={(e) => setFormData({ ...formData, hr_phone: e.target.value })}
                    className="ios-input h-12 text-foreground"
                  />
                </div>
              </div>

              {/* Job Role Dropdown */}
              <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2 block">
                  <Building2 className="w-4 h-4 text-primary" />
                  Job Role (For which position is this email?)
                </Label>
                {loadingJobs ? (
                  <div className="flex items-center justify-center h-12 glass rounded-2xl">
                    <Loader size="30px" />
                  </div>
                ) : (
                  <Select
                    value={formData.job_id}
                    onValueChange={handleJobSelect}
                  >
                    <SelectTrigger className="ios-input h-12">
                      <SelectValue placeholder="Select a job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.job_id} value={job.job_id}>
                          {job.title} - {job.department || 'General'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Candidate Details */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-3">Candidate Information</h3>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold mb-2 block">Candidate Name *</Label>
                  <Input
                    placeholder="Jane Doe"
                    value={formData.candidate_name}
                    onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                    className="ios-input h-12 text-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold mb-2 block">Company Name</Label>
                  <Input
                    placeholder="Our Company"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="ios-input h-12 text-foreground"
                  />
                </div>
              </div>

              {/* Interview Details (conditional) */}
              {(formData.email_type === 'interview_invitation' || formData.email_type === 'reschedule') && (
                <div className="space-y-4 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-3">Interview Details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold mb-2 block">Date</Label>
                      <Input
                        type="date"
                        value={formData.interview_date}
                        onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                        className="ios-input h-12 text-foreground"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold mb-2 block">Time</Label>
                      <Input
                        type="time"
                        value={formData.interview_time}
                        onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                        className="ios-input h-12 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold mb-2 block">Location</Label>
                    <Input
                      placeholder="Office / Virtual / Zoom Link"
                      value={formData.interview_location}
                      onChange={(e) => setFormData({ ...formData, interview_location: e.target.value })}
                      className="ios-input h-12 text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* Tone */}
              <div className="space-y-3 pt-4">
                <Label className="text-sm font-semibold mb-2 block">Email Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger className="ios-input h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Details */}
              <div className="space-y-3 pt-4">
                <Label className="text-sm font-semibold mb-2 block">Additional Details (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions or details to include..."
                  value={formData.additional_details}
                  onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                  className="ios-textarea min-h-[100px] text-foreground"
                />
              </div>

              {/* Generate Button */}
              <div className="pt-4 flex gap-4">
                <GenerateButton 
                  onClick={handleGenerate} 
                  loading={isGenerating}
                  disabled={isGenerating || !isFormValid}
                >
                  {isGenerating ? 'Generating' : 'Generate Draft'}
                </GenerateButton>

                {generatedEmail && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="ios-button-secondary h-[52px] px-8"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
              
              {/* Debug Info - Remove after testing */}
              {!isFormValid && (
                <div className="text-xs text-muted-foreground pt-2">
                  {!formData.candidate_name && "• Please enter candidate name"}<br/>
                  {!formData.job_title && "• Please select a job role"}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-8 sticky top-28">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Email Preview</h2>

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <Loader size="100px" />
                    <p className="text-muted-foreground mt-6 text-lg">
                      Generating your professional email...
                    </p>
                  </motion.div>
                ) : generatedEmail ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Success Badge */}
                    <div className="flex items-center gap-2 glass rounded-full px-4 py-2 w-fit">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">Generated Successfully</span>
                    </div>

                    {/* Email Content */}
                    <div className="space-y-4">
                      <div className="glass rounded-2xl p-4">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subject</Label>
                        <p className="text-lg font-semibold mt-2">{generatedEmail.subject}</p>
                      </div>

                      <div className="glass rounded-2xl p-6">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email Body</Label>
                        <div className="mt-4 whitespace-pre-wrap text-foreground leading-relaxed">
                          {generatedEmail.body}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCopyToClipboard}
                        className="ios-button-primary flex-1 h-12"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl gradient-ios-blue/10 flex items-center justify-center mb-6">
                      <Mail className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Email Generated Yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Fill in the details and click "Generate Draft" to create a professional email
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailDrafts;
