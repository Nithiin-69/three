import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import MailLoader from '../components/MailLoader';
import LottieLoader from '../components/LottieLoader';

const EmailsPrime = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [emailStage, setEmailStage] = useState('screening');
  const [emailTone, setEmailTone] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Enhanced form fields
  const [hrName, setHrName] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState('virtual');

  const [interviewLocation, setInterviewLocation] = useState('');
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/screenings');
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    // Validate interview stage fields
    if (emailStage === 'interview' && (!interviewDate || !interviewTime)) {
      toast.error('Please provide interview date and time');
      return;
    }

    setGenerating(true);
    setGeneratedEmail(null);

    try {
      const payload = {
        candidate_id: selectedCandidate,
        stage: emailStage,
        tone: emailTone
      };
      
      // Add HR name if provided
      if (hrName) {
        payload.hr_name = hrName;
      }
      
      // Add interview details if stage is interview
      if (emailStage === 'interview') {
        payload.interview_datetime = `${interviewDate}T${interviewTime}`;
        payload.interview_mode = interviewMode;
        if (interviewLocation) {
          payload.interview_location = interviewLocation;
        }
      }

      const response = await apiClient.post('/emails/generate-draft', payload);

      setGeneratedEmail(response.data);
      toast.success('Email generated successfully!');
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate email');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const candidate = candidates.find(c => c._id === selectedCandidate);

  if (loading) {
    return (
      <PrimeLayout>
        <div className="h-full flex items-center justify-center">
          <LottieLoader />
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
              <h1 className="text-2xl font-bold text-gradient-gold">Email Generator</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                AI-powered candidate communication. Less typing, more hiring.
              </p>
            </div>
            
            <button
              onClick={loadCandidates}
              className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Configuration */}
              <div className="glass-card rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-4">Email Configuration</h3>
                  
                  {/* Candidate Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Select Candidate
                      </label>
                      <select
                        value={selectedCandidate}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none cursor-pointer"
                      >
                        <option value="">Choose a candidate...</option>
                        {candidates.map((candidate) => (
                          <option key={candidate._id} value={candidate._id}>
                            {candidate.candidate_name} - {candidate.match_score}% match
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Email Stage */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pipeline Stage
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['screening', 'shortlisted', 'interview', 'offer', 'rejection'].map((stage) => (
                          <button
                            key={stage}
                            onClick={() => setEmailStage(stage)}
                            className={`
                              px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border capitalize
                              ${emailStage === stage
                                ? 'bg-elevated border-primary text-foreground'
                                : 'border-border text-foreground-secondary hover:bg-elevated'
                              }
                            `}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Email Tone */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tone
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['professional', 'friendly', 'urgent', 'casual'].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setEmailTone(tone)}
                            className={`
                              px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border capitalize
                              ${emailTone === tone
                                ? 'bg-elevated border-primary text-foreground'
                                : 'border-border text-foreground-secondary hover:bg-elevated'
                              }
                            `}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* HR Name */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        HR Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={hrName}
                        onChange={(e) => setHrName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
                      />
                    </div>

                    {/* Interview Details - Only for interview stage */}
                    {emailStage === 'interview' && (
                      <div className="space-y-4 p-4 rounded-2xl bg-elevated/50 border border-primary/20">
                        <p className="text-sm font-semibold text-primary">Interview Details</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-foreground-secondary mb-2">
                              Date *
                            </label>
                            <input
                              type="date"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-foreground-secondary mb-2">
                              Time *
                            </label>
                            <input
                              type="time"
                              value={interviewTime}
                              onChange={(e) => setInterviewTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-foreground-secondary mb-2">
                            Mode
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setInterviewMode('virtual')}
                              className={`
                                flex-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border
                                ${interviewMode === 'virtual'
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'border-border text-foreground-secondary hover:bg-elevated'
                                }
                              `}
                            >
                              Virtual
                            </button>
                            <button
                              onClick={() => setInterviewMode('in-person')}
                              className={`
                                flex-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border
                                ${interviewMode === 'in-person'
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'border-border text-foreground-secondary hover:bg-elevated'
                                }
                              `}
                            >
                              In-Person
                            </button>
                          </div>
                        </div>
                        {interviewMode === 'in-person' && (
                          <div className="mt-4">
                            <label className="block text-xs font-medium text-foreground-secondary mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={interviewLocation}
                              onChange={(e) => setInterviewLocation(e.target.value)}
                              placeholder="e.g. 123 Main St, Conference Room A"
                              className="w-full px-3 py-2 rounded-xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Candidate Info */}
                {candidate && (
                  <div className="p-4 rounded-2xl bg-elevated border border-border">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Name:</span>
                        <span className="font-medium text-foreground">{candidate.candidate_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Email:</span>
                        <span className="font-medium text-foreground">{candidate.candidate_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Match:</span>
                        <span className="font-medium text-primary">{candidate.match_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Status:</span>
                        <span className="font-medium capitalize text-foreground">{candidate.status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <PrimeButton 
                  onClick={generateEmail} 
                  disabled={!selectedCandidate || generating}
                  className="w-full"
                >
                  {generating ? 'Generating...' : 'Generate Email'}
                </PrimeButton>
              </div>

              {/* Right: Generated Email */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Generated Email</h3>
                  {generatedEmail && (
                    <button
                      onClick={() => copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                      className="px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy All
                        </>
                      )}
                    </button>
                  )}
                </div>

                {generating && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <MailLoader text="Generating" />
                  </div>
                )}

                {!generating && !generatedEmail && (
                  <div className="text-center py-16">
                    <Send className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                    <p className="text-foreground-secondary">
                      Configure options and click "Generate Email"
                    </p>
                    <p className="text-sm text-foreground-muted mt-2">
                      AI will draft the perfect email for you
                    </p>
                  </div>
                )}

                {!generating && generatedEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-medium text-foreground-secondary mb-2">
                        Subject
                      </label>
                      <div className="p-3 rounded-xl bg-elevated border border-border">
                        <p className="text-sm font-medium text-foreground">{generatedEmail.subject}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generatedEmail.subject)}
                        className="mt-2 text-xs text-primary hover:text-primary/80"
                      >
                        Copy Subject
                      </button>
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-xs font-medium text-foreground-secondary mb-2">
                        Email Body
                      </label>
                      <div className="p-4 rounded-xl bg-elevated border border-border max-h-96 overflow-y-auto scrollbar-custom">
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {generatedEmail.body}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generatedEmail.body)}
                        className="mt-2 text-xs text-primary hover:text-primary/80"
                      >
                        Copy Body
                      </button>
                    </div>

                    {/* Tone Badge */}
                    {generatedEmail.tone && (
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-foreground-secondary">Tone:</span>
                        <span className="capsule-status border bg-primary/10 text-primary border-primary/20 capitalize">
                          {generatedEmail.tone}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <PrimeButton onClick={generateEmail} className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </PrimeButton>
                      <button className="flex-1 px-4 py-2.5 rounded-full border border-border hover:bg-elevated transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Email
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrimeLayout>
  );
};

export default EmailsPrime;
