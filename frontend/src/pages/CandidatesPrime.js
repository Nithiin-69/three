import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, Eye, Send, Star, X, Mail,
  Phone, MapPin, Briefcase, GraduationCap, Award, Calendar,
  ChevronDown, Check, MoreVertical, ArrowUpDown, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import LottieLoader from '../components/LottieLoader';

const Candidates = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candidatesRes, jobsRes] = await Promise.all([
        apiClient.get('/screenings'),
        apiClient.get('/jobs')
      ]);
      
      setCandidates(candidatesRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];
    
    // Search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Score filter
    if (scoreFilter !== 'all') {
      if (scoreFilter === 'high') filtered = filtered.filter(c => c.match_score >= 80);
      else if (scoreFilter === 'medium') filtered = filtered.filter(c => c.match_score >= 50 && c.match_score < 80);
      else if (scoreFilter === 'low') filtered = filtered.filter(c => c.match_score < 50);
    }
    
    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(c => c.job_id === jobFilter);
    }
    
    // Sort
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortBy === 'score-desc') {
      filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    } else if (sortBy === 'score-asc') {
      filtered.sort((a, b) => (a.match_score || 0) - (b.match_score || 0));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => (a.candidate_name || '').localeCompare(b.candidate_name || ''));
    }
    
    return filtered;
  }, [candidates, searchQuery, statusFilter, scoreFilter, jobFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get score badge color - Multi-color based on score ranges
  const getScoreBadgeColor = (score) => {
    if (score >= 75) return 'from-[#926c15] to-[#b8860b]'; // Dark gold
    if (score >= 40) return 'from-[#6B8E23] to-[#556b2f]'; // Olive green
    return 'from-[#fb5607] to-[#ff6b35]'; // Orange-red
  };

  // Get status badge
  // Get status styles for inline dropdown
  const getStatusStyles = (status) => {
    const styles = {
      'new': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'screening': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'shortlisted': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      'interviewed': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      'offered': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      'hired': 'bg-green-500/10 text-green-500 border-green-500/30',
      'rejected': 'bg-red-500/10 text-red-500 border-red-500/30'
    };
    return styles[status] || styles.new;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'screening': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'shortlisted': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'interview': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
      'hired': 'bg-green-500/10 text-green-500 border-green-500/20'
    };
    
    return (
      <span className={`capsule-status border ${styles[status] || styles.pending}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status || 'pending'}
      </span>
    );
  };

  // Update candidate status - SMART UPDATE without page refresh
  const updateCandidateStatus = async (candidateId, newStatus) => {
    // Store original status for rollback
    const originalCandidates = [...candidates];
    
    try {
      setUpdatingStatus(true);
      
      // 1. OPTIMISTIC UPDATE - Update UI immediately
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => 
          candidate._id === candidateId 
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );
      
      // 2. Update backend
      await apiClient.post('/screenings/bulk-update-status', {
        screening_ids: [candidateId],
        status: newStatus
      });
      
      toast.success(`Status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Status update failed:', error);
      // ROLLBACK on error - restore original state
      setCandidates(originalCandidates);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      toast.error('No candidates selected');
      return;
    }
    
    try {
      await apiClient.post('/screenings/bulk-update', {
        ids: selectedIds,
        status: action
      });
      
      toast.success(`${selectedIds.length} candidates moved to ${action}`);
      setSelectedIds([]);
      loadData();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Match Score', 'Status', 'Job', 'Date'].join(','),
      ...filteredCandidates.map(c => [
        c.candidate_name,
        c.candidate_email,
        c.match_score,
        c.status,
        jobs.find(j => j._id === c.job_id)?.title || 'N/A',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.csv';
    a.click();
    
    toast.success('Candidates exported');
  };

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
              <h1 className="text-2xl font-bold text-gradient-gold">Candidates</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                Manage your talent pool. {filteredCandidates.length} candidates found.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={handleExport}
                className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <PrimeButton onClick={() => navigate('/screening')}>
                Screen New Batch
              </PrimeButton>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm cursor-pointer"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (50-79)</option>
                <option value="low">Low (&lt;50)</option>
              </select>
              
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm cursor-pointer"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm cursor-pointer"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Score: High to Low</option>
                <option value="score-asc">Score: Low to High</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3"
            >
              <span className="text-sm text-foreground-secondary">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('shortlisted')}
                className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                Shortlist
              </button>
              <button
                onClick={() => handleBulkAction('rejected')}
                className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 rounded-full bg-elevated border border-border text-sm font-medium hover:bg-surface transition-colors"
              >
                Clear
              </button>
            </motion.div>
          )}
        </div>

        {/* Candidate Table */}
        <div className="p-6">
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-elevated border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedCandidates.length && paginatedCandidates.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(paginatedCandidates.map(c => c._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Candidate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Job Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedCandidates.map((candidate, index) => (
                    <motion.tr
                      key={candidate._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-elevated/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(candidate._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, candidate._id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== candidate._id));
                            }
                          }}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreBadgeColor(candidate.match_score)} flex items-center justify-center text-white font-bold text-sm`}>
                          {candidate.match_score || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-foreground">{candidate.candidate_name || 'Unknown'}</div>
                          <div className="text-sm text-foreground-secondary">{candidate.candidate_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            key={`status-${candidate._id}-${candidate.status}`}
                            value={candidate.status}
                            onChange={(e) => updateCandidateStatus(candidate._id, e.target.value)}
                            disabled={updatingStatus}
                            className={`
                              capsule-status px-3 py-1.5 rounded-full text-xs font-medium border-2 cursor-pointer
                              transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary
                              ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                              ${getStatusStyles(candidate.status)}
                            `}
                          >
                            <option value="new">Screening</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interviewed">Interview</option>
                            <option value="offered">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {candidate.job_title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground-secondary">
                          {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-surface rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-foreground-secondary" />
                          </button>
                          <button 
                            onClick={() => navigate(`/emails?candidate=${candidate._id}`)}
                            className="p-2 hover:bg-surface rounded-full transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 text-foreground-secondary hover:text-primary" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedCandidates.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <p className="text-foreground-secondary">No candidates found</p>
                  <p className="text-sm text-foreground-muted mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-foreground-secondary">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full bg-elevated border border-border disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? 'gradient-gold-silver text-background'
                              : 'text-foreground-secondary hover:bg-elevated'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full bg-elevated border border-border disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedCandidate && (
            <CandidateDetailModal
              candidate={selectedCandidate}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedCandidate(null);
              }}
              getStatusBadge={getStatusBadge}
              getScoreBadgeColor={getScoreBadgeColor}
            />
          )}
        </AnimatePresence>
      </div>
    </PrimeLayout>
  );
};

// Candidate Detail Modal
const CandidateDetailModal = ({ candidate, onClose, getStatusBadge, getScoreBadgeColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-static rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto scrollbar-custom"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getScoreBadgeColor(candidate.match_score)} flex items-center justify-center text-white font-bold text-2xl`}>
              {candidate.match_score || 0}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{candidate.candidate_name || 'Unknown'}</h2>
              <p className="text-foreground-secondary flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {candidate.candidate_email}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-elevated rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-foreground-secondary mb-2 block">Current Status</label>
            {getStatusBadge(candidate.status)}
          </div>

          {/* Score Breakdown */}
          <div>
            <label className="text-sm font-medium text-foreground-secondary mb-3 block">Score Breakdown</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Overall Match', value: candidate.match_score || 0, icon: Star },
                { label: 'Experience', value: candidate.experience_score || 0, icon: Briefcase },
                { label: 'Skills Match', value: candidate.skills_score || 0, icon: Award },
                { label: 'Keywords', value: candidate.keyword_score || 0, icon: GraduationCap },
              ].map(score => {
                const Icon = score.icon;
                return (
                  <div key={score.label} className="p-4 rounded-2xl bg-elevated border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground-secondary">{score.label}</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{score.value}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Summary */}
          {candidate.summary && (
            <div>
              <label className="text-sm font-medium text-foreground-secondary mb-2 block">AI Analysis</label>
              <div className="p-4 rounded-2xl bg-elevated border border-border">
                <p className="text-foreground leading-relaxed">{candidate.summary}</p>
              </div>
            </div>
          )}

          {/* Screening Details */}
          {candidate.screening_details && (
            <div>
              <label className="text-sm font-medium text-foreground-secondary mb-2 block">Detailed Screening</label>
              <div className="p-4 rounded-2xl bg-elevated border border-border space-y-2">
                {Object.entries(candidate.screening_details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-foreground-secondary capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <PrimeButton onClick={() => updateCandidateStatus(selectedCandidate._id, 'shortlisted')}>
              Shortlist Candidate
            </PrimeButton>
            <button 
              onClick={() => {
                setShowDetailModal(false);
                navigate(`/emails?candidate=${selectedCandidate._id}`);
              }}
              className="px-6 py-2.5 rounded-full border border-border hover:bg-elevated hover:border-primary transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button 
              onClick={() => navigate(`/calendar`)}
              className="px-6 py-2.5 rounded-full border border-border hover:bg-elevated transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Candidates;
