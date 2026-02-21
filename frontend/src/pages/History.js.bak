import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, LogOut, Eye, Award, TrendingUp, TrendingDown, Minus, Filter, Search, 
  Download, GitCompare, Trash2, CheckSquare, Square, X, FileDown, Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [filteredScreenings, setFilteredScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Comparison
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    checkAuthAndLoadScreenings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenings, searchTerm, statusFilter, scoreFilter, sortBy]);

  useEffect(() => {
    setShowBulkActions(selectedIds.length > 0);
  }, [selectedIds]);

  const checkAuthAndLoadScreenings = async () => {
    try {
      const userResponse = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(userResponse.data);
      await loadScreenings();
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadScreenings = async () => {
    try {
      const response = await axios.get(`${API}/screenings`, {
        withCredentials: true
      });
      setScreenings(response.data);
    } catch (error) {
      console.error('Error loading screenings:', error);
      toast.error('Failed to load screening history');
    }
  };

  const applyFilters = () => {
    let filtered = [...screenings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Score filter
    if (scoreFilter === 'high') {
      filtered = filtered.filter(s => s.match_score >= 80);
    } else if (scoreFilter === 'medium') {
      filtered = filtered.filter(s => s.match_score >= 60 && s.match_score < 80);
    } else if (scoreFilter === 'low') {
      filtered = filtered.filter(s => s.match_score < 60);
    }

    // Sort
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'score-desc') {
      filtered.sort((a, b) => b.match_score - a.match_score);
    } else if (sortBy === 'score-asc') {
      filtered.sort((a, b) => a.match_score - b.match_score);
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => (a.candidate_name || '').localeCompare(b.candidate_name || ''));
    }

    setFilteredScreenings(filtered);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const viewDetails = async (screeningId) => {
    try {
      const response = await axios.get(`${API}/screenings/${screeningId}`, {
        withCredentials: true
      });
      setSelectedScreening(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Failed to load screening details');
    }
  };

  const updateStatus = async (screeningId, newStatus) => {
    try {
      await axios.put(
        `${API}/screenings/${screeningId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update local state
      setScreenings(screenings.map(s => 
        s.screening_id === screeningId ? { ...s, status: newStatus } : s
      ));
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    try {
      await axios.post(
        `${API}/screenings/bulk-update-status`,
        { screening_ids: selectedIds, status: newStatus },
        { withCredentials: true }
      );
      
      // Update local state
      setScreenings(screenings.map(s => 
        selectedIds.includes(s.screening_id) ? { ...s, status: newStatus } : s
      ));
      
      setSelectedIds([]);
      toast.success(`Updated ${selectedIds.length} candidate(s) to ${newStatus}`);
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Failed to update candidates');
    }
  };

  const exportCSV = async () => {
    try {
      window.open(`${API}/screenings/export/csv?status=${statusFilter !== 'all' ? statusFilter : ''}`, '_blank');
      toast.success('Exporting screening results...');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  const toggleSelection = (screeningId) => {
    if (selectedIds.includes(screeningId)) {
      setSelectedIds(selectedIds.filter(id => id !== screeningId));
    } else {
      setSelectedIds([...selectedIds, screeningId]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredScreenings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredScreenings.map(s => s.screening_id));
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareIds([]);
  };

  const toggleCompare = (screeningId) => {
    if (compareIds.includes(screeningId)) {
      setCompareIds(compareIds.filter(id => id !== screeningId));
    } else {
      if (compareIds.length < 3) {
        setCompareIds([...compareIds, screeningId]);
      } else {
        toast.error('You can compare up to 3 candidates');
      }
    }
  };

  const openComparison = () => {
    if (compareIds.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    setShowComparison(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      new: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      shortlisted: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      interviewed: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      hired: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };
    return variants[status] || variants.new;
  };

  const getActionBadge = (action) => {
    const variants = {
      'Interview': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      'Maybe': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      'Reject': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };
    return variants[action] || variants.Maybe;
  };

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading screening history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="44" height="44" rx="12" fill="url(#logo-gradient)" />
                  <path d="M22 12L28 18L22 24L16 18L22 12Z" fill="white" opacity="0.9" />
                  <path d="M22 20L28 26L22 32L16 26L22 20Z" fill="white" opacity="0.6" />
                  <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="44" y2="44">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Recruit-AI
                </span>
              </div>
              
              <div className="hidden md:flex gap-6">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/jobs')}>Jobs</Button>
                <Button variant="ghost" onClick={() => navigate('/screening')}>Screen Resumes</Button>
                <Button variant="ghost" className="bg-indigo-100 dark:bg-indigo-900/30">History</Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Screening History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all candidate screening results
          </p>
        </motion.div>

        {/* Filters and Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search and Primary Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by candidate name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Score Filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Score Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80-100)</SelectItem>
                <SelectItem value="medium">Medium (60-79)</SelectItem>
                <SelectItem value="low">Low (0-59)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="score-desc">Highest Score</SelectItem>
                <SelectItem value="score-asc">Lowest Score</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={toggleAll}
              className="gap-2"
            >
              {selectedIds.length === filteredScreenings.length ? (
                <><CheckSquare className="h-4 w-4" /> Deselect All</>
              ) : (
                <><Square className="h-4 w-4" /> Select All</>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={toggleCompareMode}
              className={`gap-2 ${compareMode ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
            >
              <GitCompare className="h-4 w-4" />
              {compareMode ? 'Exit Compare' : 'Compare'}
            </Button>

            {compareMode && compareIds.length >= 2 && (
              <Button
                onClick={openComparison}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Users className="h-4 w-4" />
                Compare {compareIds.length} Candidates
              </Button>
            )}

            <Button
              variant="outline"
              onClick={exportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  {selectedIds.length} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('shortlisted')}>
                    Shortlist
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('interviewed')}>
                    Mark Interviewed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('hired')}>
                    Mark Hired
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('rejected')}>
                    Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredScreenings.length} of {screenings.length} candidates
        </div>

        {/* Screening Cards */}
        {filteredScreenings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No screening results found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || statusFilter !== 'all' || scoreFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start screening resumes to see results here'}
            </p>
            {(searchTerm || statusFilter !== 'all' || scoreFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setScoreFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredScreenings.map((screening, index) => (
              <motion.div
                key={screening.screening_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-300 dark:hover:border-indigo-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="flex items-center pt-1">
                        <button
                          onClick={() => compareMode ? toggleCompare(screening.screening_id) : toggleSelection(screening.screening_id)}
                          className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                        >
                          {(compareMode ? compareIds : selectedIds).includes(screening.screening_id) && (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                              {screening.candidate_name || 'Unknown Candidate'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Applied for: <span className="font-semibold">{screening.job_title}</span>
                              {screening.job_department && ` • ${screening.job_department}`}
                            </p>
                          </div>

                          {/* Match Score Badge */}
                          <div className={`px-4 py-2 rounded-full ${getScoreBgColor(screening.match_score)}`}>
                            <div className={`text-2xl font-bold ${getScoreColor(screening.match_score)}`}>
                              {screening.match_score}%
                            </div>
                            <div className="text-xs text-center text-slate-600 dark:text-slate-400">Match</div>
                          </div>
                        </div>

                        {/* Scores Breakdown */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Experience</div>
                            <Progress value={screening.experience_score} className="h-2" />
                            <div className="text-xs font-semibold mt-1">{screening.experience_score}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Skills</div>
                            <Progress value={screening.skills_score} className="h-2" />
                            <div className="text-xs font-semibold mt-1">{screening.skills_score}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Keywords</div>
                            <Progress value={screening.keyword_score} className="h-2" />
                            <div className="text-xs font-semibold mt-1">{screening.keyword_score}%</div>
                          </div>
                        </div>

                        {/* Badges and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge className={getStatusBadgeVariant(screening.status)}>
                              {screening.status.charAt(0).toUpperCase() + screening.status.slice(1)}
                            </Badge>
                            <Badge className={getActionBadge(screening.recommended_action)}>
                              {screening.recommended_action}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            {/* Status Update Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Update Status
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateStatus(screening.screening_id, 'shortlisted')}>
                                  Shortlist
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(screening.screening_id, 'interviewed')}>
                                  Mark Interviewed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(screening.screening_id, 'hired')}>
                                  Mark Hired
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(screening.screening_id, 'rejected')}>
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              size="sm"
                              onClick={() => viewDetails(screening.screening_id)}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedScreening && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedScreening.candidate_name || 'Candidate'} - Detailed Analysis
                </DialogTitle>
                <DialogDescription>
                  Applied for: {selectedScreening.job?.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Score Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedScreening.match_score}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Overall Match</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedScreening.experience_score}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Experience</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                        {selectedScreening.skills_score}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Skills</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedScreening.keyword_score}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Keywords</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    AI Summary
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedScreening.summary}
                  </p>
                </div>

                {/* Recommendation */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">Recommendation</h4>
                  <Badge className={getActionBadge(selectedScreening.recommended_action) + ' text-lg px-4 py-2'}>
                    {selectedScreening.recommended_action}
                  </Badge>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {selectedScreening.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                        <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                {selectedScreening.gaps && selectedScreening.gaps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <TrendingDown className="h-5 w-5" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {selectedScreening.gaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-1">!</span>
                          <span className="text-slate-700 dark:text-slate-300">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Highlights */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedScreening.key_highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 mt-1">★</span>
                        <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Analysis */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">Detailed Analysis</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedScreening.detailed_analysis}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <GitCompare className="h-6 w-6" />
              Candidate Comparison
            </DialogTitle>
            <DialogDescription>
              Side-by-side comparison of selected candidates
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {compareIds.map(id => {
              const candidate = screenings.find(s => s.screening_id === id);
              if (!candidate) return null;

              return (
                <Card key={id} className="border-2 border-indigo-200 dark:border-indigo-800">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {candidate.candidate_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{candidate.job_title}</p>
                    </div>

                    {/* Scores */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Match</span>
                          <span className="font-bold">{candidate.match_score}%</span>
                        </div>
                        <Progress value={candidate.match_score} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Experience</span>
                          <span className="font-bold">{candidate.experience_score}%</span>
                        </div>
                        <Progress value={candidate.experience_score} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Skills</span>
                          <span className="font-bold">{candidate.skills_score}%</span>
                        </div>
                        <Progress value={candidate.skills_score} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Keywords</span>
                          <span className="font-bold">{candidate.keyword_score}%</span>
                        </div>
                        <Progress value={candidate.keyword_score} />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="space-y-2">
                      <Badge className={getStatusBadgeVariant(candidate.status) + ' w-full justify-center'}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </Badge>
                      <Badge className={getActionBadge(candidate.recommended_action) + ' w-full justify-center'}>
                        {candidate.recommended_action}
                      </Badge>
                    </div>

                    {/* Top Strengths */}
                    <div className="mt-4">
                      <h5 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-400">Top Strengths:</h5>
                      <ul className="text-xs space-y-1">
                        {candidate.strengths.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="text-slate-700 dark:text-slate-300">• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full mt-4"
                      size="sm"
                      variant="outline"
                      onClick={() => viewDetails(candidate.screening_id)}
                    >
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Winner Indicator */}
          {compareIds.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-100">Top Candidate:</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {(() => {
                      const candidates = compareIds.map(id => screenings.find(s => s.screening_id === id)).filter(Boolean);
                      const topCandidate = candidates.reduce((prev, current) => 
                        (prev.match_score > current.match_score) ? prev : current
                      );
                      return topCandidate.candidate_name || 'Unknown';
                    })()} with the highest overall match score
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
