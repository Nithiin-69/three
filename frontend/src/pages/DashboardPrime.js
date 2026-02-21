import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, CheckCircle, Target, Search, Filter, Download, 
  Eye, RefreshCw, MoreVertical, Star, Award, BarChart3, PieChart,
  Activity, Clock, Zap, ArrowRight, Calendar as CalendarIcon,
  FileText, Mail, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import LottieLoader from '../components/LottieLoader';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics
  const [analytics, setAnalytics] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Filters for candidate table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, screeningsRes, jobsRes, eventsRes] = await Promise.all([
        apiClient.get('/analytics/dashboard').catch(() => ({ data: null })),
        apiClient.get('/screenings').catch(() => ({ data: [] })),
        apiClient.get('/jobs').catch(() => ({ data: [] })),
        apiClient.get('/calendar/events', {
          params: {
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        }).catch(() => ({ data: [] }))
      ]);
      
      setAnalytics(analyticsRes.data);
      setScreenings(screeningsRes.data || []);
      setJobs(jobsRes.data || []);
      
      const now = new Date();
      const upcoming = (eventsRes.data || [])
        .filter(event => new Date(event.start_datetime) >= now)
        .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
        .slice(0, 5);
      setUpcomingEvents(upcoming);
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return screenings.filter(candidate => {
      const matchesSearch = !searchQuery || 
        candidate.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [screenings, searchQuery, statusFilter]);

  // Get score badge color
  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'from-emerald-400 to-emerald-600';
    if (score >= 70) return 'from-blue-400 to-blue-600';
    if (score >= 50) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  // Get status badge
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
              <h1 className="text-2xl font-bold text-gradient-gold">Dashboard</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                Your pipeline is {screenings.length > 0 ? 'looking good' : 'pristine. Suspiciously so'}. 
                {screenings.length === 0 && ' Upload resumes and let AI do the dirty work.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <PrimeButton onClick={() => navigate('/screening')}>
                Screen Resumes
              </PrimeButton>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${activeTab === 'overview' 
                  ? 'bg-elevated border-primary text-foreground' 
                  : 'text-foreground-secondary hover:text-foreground hover:bg-elevated border-transparent'
                }
              `}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`
                px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${activeTab === 'analytics' 
                  ? 'bg-elevated border-primary text-foreground' 
                  : 'text-foreground-secondary hover:text-foreground hover:bg-elevated border-transparent'
                }
              `}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <OverviewTab 
              analytics={analytics}
              screenings={screenings}
              filteredCandidates={filteredCandidates}
              upcomingEvents={upcomingEvents}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              getScoreBadgeColor={getScoreBadgeColor}
              getStatusBadge={getStatusBadge}
              setSelectedCandidate={setSelectedCandidate}
              setShowCandidateModal={setShowCandidateModal}
            />
          ) : (
            <AnalyticsTab 
              analytics={analytics}
              screenings={screenings}
              jobs={jobs}
            />
          )}
        </div>

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {showCandidateModal && selectedCandidate && (
            <CandidateModal 
              candidate={selectedCandidate}
              onClose={() => {
                setShowCandidateModal(false);
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

// Overview Tab Component
const OverviewTab = ({ 
  analytics, screenings, filteredCandidates, upcomingEvents,
  searchQuery, setSearchQuery, statusFilter, setStatusFilter,
  getScoreBadgeColor, getStatusBadge, setSelectedCandidate, setShowCandidateModal
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* AI Narrative Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 border-l-4 border-primary"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground-secondary mb-2">AI Summary</h3>
            <p className="text-foreground leading-relaxed">
              {screenings.length === 0 
                ? "Your pipeline is pristine. Suspiciously so. Upload resumes and let AI do the dirty work."
                : screenings.filter(s => s.status === 'shortlisted').length > 0
                ? `${screenings.filter(s => s.status === 'shortlisted').length} candidates need urgent review. Your top role has ${screenings.filter(s => s.match_score >= 94).length} high-match candidates sitting unreviewed. That's on you.`
                : `Screening ${screenings.length} applicants so you don't have to. You're welcome.`
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Candidates', 
            value: screenings.length || 0, 
            icon: Users, 
            color: 'from-blue-400 to-blue-600',
            show: true
          },
          { 
            label: 'Avg Match Score', 
            value: analytics?.average_scores?.overall 
              ? `${Math.round(analytics.average_scores.overall)}%` 
              : '0%', 
            icon: Target, 
            color: 'from-purple-400 to-purple-600',
            show: analytics?.average_scores?.overall > 0
          },
          { 
            label: 'Shortlisted', 
            value: screenings.filter(s => s.status === 'shortlisted').length || 0, 
            icon: CheckCircle, 
            color: 'from-emerald-400 to-emerald-600',
            show: true
          },
          { 
            label: 'Conversion Rate', 
            value: analytics?.conversion_rate 
              ? `${Math.round(analytics.conversion_rate)}%` 
              : '0%', 
            icon: TrendingUp, 
            color: 'from-amber-400 to-amber-600',
            show: analytics?.conversion_rate > 0
          },
        ].filter(stat => stat.show).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl p-6 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-foreground-secondary">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Candidates</h2>
              <button
                onClick={() => navigate('/candidates')}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-3">
              {filteredCandidates.slice(0, 10).map((candidate, index) => (
                <motion.div
                  key={candidate._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-elevated hover:bg-surface border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowCandidateModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreBadgeColor(candidate.match_score)} flex items-center justify-center text-white font-bold`}>
                        {candidate.match_score || 0}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {candidate.candidate_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-foreground-secondary truncate">
                          {candidate.candidate_email || 'No email'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(candidate.status)}
                      <button className="p-2 hover:bg-surface rounded-full transition-colors">
                        <Eye className="w-4 h-4 text-foreground-secondary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                  <p className="text-foreground-secondary">No candidates found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Upcoming</h3>
              <CalendarIcon className="w-4 h-4 text-foreground-muted" />
            </div>
            
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <div key={event._id || index} className="p-3 rounded-xl bg-elevated border border-border">
                  <div className="text-sm font-medium text-foreground mb-1">{event.title}</div>
                  <div className="text-xs text-foreground-secondary flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(event.start_datetime).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-foreground-secondary text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
            
            <button
              onClick={() => navigate('/calendar')}
              className="w-full mt-4 px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border text-sm font-medium transition-colors"
            >
              View Calendar
            </button>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => navigate('/screening')}
                className="w-full px-4 py-3 rounded-2xl bg-elevated hover:bg-surface border border-border text-sm font-medium text-left flex items-center gap-3 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary" />
                Screen New Resumes
              </button>
              
              <button
                onClick={() => navigate('/jobs')}
                className="w-full px-4 py-3 rounded-2xl bg-elevated hover:bg-surface border border-border text-sm font-medium text-left flex items-center gap-3 transition-colors"
              >
                <Award className="w-4 h-4 text-accent" />
                Create Job Opening
              </button>
              
              <button
                onClick={() => navigate('/emails')}
                className="w-full px-4 py-3 rounded-2xl bg-elevated hover:bg-surface border border-border text-sm font-medium text-left flex items-center gap-3 transition-colors"
              >
                <Mail className="w-4 h-4 text-success" />
                Draft Candidate Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component (integrated into Dashboard)
const AnalyticsTab = ({ analytics, screenings, jobs }) => {
  // Prepare chart data
  const statusData = analytics?.status_breakdown 
    ? Object.entries(analytics.status_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const topJobsData = analytics?.top_jobs?.map(job => ({
    name: job.title.substring(0, 20),
    candidates: job.candidate_count
  })) || [];

  const scoreDistribution = [
    { range: '90-100', count: screenings.filter(s => s.match_score >= 90).length },
    { range: '70-89', count: screenings.filter(s => s.match_score >= 70 && s.match_score < 90).length },
    { range: '50-69', count: screenings.filter(s => s.match_score >= 50 && s.match_score < 70).length },
    { range: '0-49', count: screenings.filter(s => s.match_score < 50).length },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Pipeline Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Jobs Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Top Positions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topJobsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground-secondary))" />
              <YAxis stroke="hsl(var(--foreground-secondary))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="candidates" fill="#D4AF37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--foreground-secondary))" />
              <YAxis stroke="hsl(var(--foreground-secondary))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="count" fill="#C0C0C0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Hiring Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { month: 'Jan', candidates: 20 },
              { month: 'Feb', candidates: 35 },
              { month: 'Mar', candidates: 45 },
              { month: 'Apr', candidates: screenings.length },
            ]}>
              <defs>
                <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground-secondary))" />
              <YAxis stroke="hsl(var(--foreground-secondary))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="candidates" 
                stroke="#D4AF37" 
                fillOpacity={1} 
                fill="url(#colorCandidates)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

// Candidate Detail Modal
const CandidateModal = ({ candidate, onClose, getStatusBadge, getScoreBadgeColor }) => {
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
        className="glass-card-static rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreBadgeColor(candidate.match_score)} flex items-center justify-center text-white font-bold text-xl`}>
              {candidate.match_score || 0}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{candidate.candidate_name || 'Unknown'}</h2>
              <p className="text-foreground-secondary">{candidate.candidate_email}</p>
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
            <label className="text-sm font-medium text-foreground-secondary mb-2 block">Status</label>
            {getStatusBadge(candidate.status)}
          </div>

          {/* Scores */}
          <div>
            <label className="text-sm font-medium text-foreground-secondary mb-3 block">Score Breakdown</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Match Score', value: candidate.match_score || 0 },
                { label: 'Experience', value: candidate.experience_score || 0 },
                { label: 'Skills', value: candidate.skills_score || 0 },
                { label: 'Keywords', value: candidate.keyword_score || 0 },
              ].map(score => (
                <div key={score.label} className="p-4 rounded-2xl bg-elevated">
                  <div className="text-xs text-foreground-secondary mb-1">{score.label}</div>
                  <div className="text-2xl font-bold text-foreground">{score.value}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {candidate.summary && (
            <div>
              <label className="text-sm font-medium text-foreground-secondary mb-2 block">AI Summary</label>
              <p className="text-foreground bg-elevated p-4 rounded-2xl leading-relaxed">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <PrimeButton onClick={() => console.log('Shortlist', candidate._id)}>
              Shortlist Candidate
            </PrimeButton>
            <button className="px-6 py-2.5 rounded-full border border-border hover:bg-elevated transition-colors text-sm font-medium">
              Send Email
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
