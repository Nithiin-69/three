import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Briefcase, CheckCircle, XCircle, 
  Clock, Calendar, ArrowUpRight, ArrowDownRight, BarChart3,
  PieChart as PieChartIcon, Download, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ReportsPrime = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/analytics/detailed-reports');
      setAnalytics(response.data);
      if (!loading) {
        toast.success('Analytics refreshed');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const COLORS = ['#D4AF37', '#926c15', '#6B8E23', '#fb5607', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <PrimeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-secondary">Loading analytics...</p>
          </div>
        </div>
      </PrimeLayout>
    );
  }

  return (
    <PrimeLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-foreground-secondary mt-1">Comprehensive recruitment insights</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadAnalytics}
              disabled={refreshing}
              className="hover:border-primary hover:text-primary"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button className="bg-primary text-background font-bold hover:bg-primary/90 border-2 border-primary">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Applications */}
          <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.total_applications || 0}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    All time
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screened */}
          <Card className="glass-card border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Screened</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.screened || 0}</p>
                  <p className="text-xs text-blue-500 mt-2">
                    {analytics?.total_applications > 0 
                      ? Math.round((analytics.screened / analytics.total_applications) * 100)
                      : 0}% of total
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card className="glass-card border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Shortlisted</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.shortlisted || 0}</p>
                  <p className="text-xs text-emerald-500 mt-2">
                    {analytics?.screened > 0 
                      ? Math.round((analytics.shortlisted / analytics.screened) * 100)
                      : 0}% pass rate
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejected */}
          <Card className="glass-card border-red-500/20 hover:border-red-500/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.rejected || 0}</p>
                  <p className="text-xs text-red-500 mt-2">
                    {analytics?.total_applications > 0 
                      ? Math.round((analytics.rejected / analytics.total_applications) * 100)
                      : 0}% of total
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-500/10">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Interviews Scheduled</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.interviewed || 0}</p>
                </div>
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Offers Extended</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.offered || 0}</p>
                </div>
                <Briefcase className="w-5 h-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Hired</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.hired || 0}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
              <CardDescription>Candidate flow through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.pipeline_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="stage" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Breakdown by candidate status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(analytics?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avg Time to Hire */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Time Metrics</CardTitle>
              <CardDescription>Efficiency indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-elevated/50">
                <div>
                  <p className="text-sm text-foreground-secondary">Avg. Time to Hire</p>
                  <p className="text-2xl font-bold text-primary">{analytics?.avg_time_to_hire || 0} days</p>
                </div>
                <Clock className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-elevated/50">
                <div>
                  <p className="text-sm text-foreground-secondary">Screening Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {analytics?.screening_pass_rate || 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-elevated/50">
                <div>
                  <p className="text-sm text-foreground-secondary">Offer Acceptance Rate</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {analytics?.offer_acceptance_rate || 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Jobs */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Top Performing Jobs</CardTitle>
              <CardDescription>By application volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(analytics?.top_jobs || []).slice(0, 5).map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-elevated/50 hover:bg-elevated transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.title}</p>
                      <p className="text-xs text-foreground-secondary">{job.applications} applications</p>
                    </div>
                    <div className="text-primary font-bold text-lg ml-4">
                      #{index + 1}
                    </div>
                  </div>
                ))}
                {(!analytics?.top_jobs || analytics.top_jobs.length === 0) && (
                  <p className="text-center text-foreground-secondary py-8">No jobs data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrimeLayout>
  );
};

export default ReportsPrime;
