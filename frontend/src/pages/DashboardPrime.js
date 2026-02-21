import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, TrendingUp, Clock, Calendar, Activity, 
  CheckCircle, XCircle, PieChart as PieChartIcon, BarChart3,
  Filter, MoreHorizontal, ArrowUpRight, ArrowRight, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

const COLORS = ['#D4AF37', '#9CA3AF', '#4B5563', '#1F2937']; // Gold, Silver, Dark Gray, Black
const STATUS_COLORS = {
  new: '#60A5FA', // Blue
  shortlisted: '#D4AF37', // Gold
  interviewed: '#A78BFA', // Purple
  offered: '#34D399', // Emerald
  hired: '#10B981', // Green
  rejected: '#EF4444', // Red
};

const DashboardPrime = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.get('/analytics/dashboard');
      setMetrics(res.data);
      if (!loading) {
        toast.success('Dashboard refreshed');
      }
    } catch (error) {
      console.error('Failed to load dashboard', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <PrimeLayout>
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </PrimeLayout>
    );
  }

  // Transform pipeline data for charts
  const pipelineData = metrics?.pipeline_funnel ? Object.entries(metrics.pipeline_funnel).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  // Transform source data
  const sourceData = metrics?.source_breakdown || [];

  return (
    <PrimeLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your recruitment pipeline.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadDashboardData}
              disabled={refreshing}
              className="hover:border-primary hover:text-primary transition-all"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button className="bg-primary text-[#0F172A] font-semibold hover:bg-primary/90">
              <TrendingUp className="mr-2 h-4 w-4" /> View Reports
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Candidates" 
            value={metrics?.total_candidates?.count || 0}
            trend={metrics?.total_candidates?.trend > 0 ? `+${metrics.total_candidates.trend} this week` : null}
            icon={Users}
            color="text-blue-500"
          />
          <MetricCard 
            title="Active Jobs" 
            value={metrics?.active_jobs || 0}
            subtext="Open positions"
            icon={Briefcase}
            color="text-primary"
          />
          <MetricCard 
            title="Screening Pass Rate" 
            value={`${metrics?.screening_pass_rate || 0}%`}
            subtext="Recommended candidates"
            icon={CheckCircle}
            color="text-green-500"
          />
          <MetricCard 
            title="Time to Hire" 
            value={`${metrics?.avg_time_to_hire || 0} days`}
            subtext="Average duration"
            icon={Clock}
            color="text-purple-500"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Funnel */}
          <Card className="lg:col-span-2 glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Candidates by stage</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#888'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Next 3 scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.upcoming_interviews?.length > 0 ? (
                  metrics.upcoming_interviews.map((event, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-elevated/50 border border-border/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {new Date(event.start_datetime).getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.candidate_name || 'Candidate'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.event_type}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No upcoming interviews
                  </div>
                )}
                <Button variant="ghost" className="w-full text-xs" size="sm" onClick={() => navigate('/calendar')}>
                  View Calendar <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Source Breakdown */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Candidate Sources</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold">{metrics?.total_candidates?.count || 0}</span>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Acceptance Rate */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Offer Acceptance</CardTitle>
              <CardDescription>Conversion metric</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[250px]">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (metrics?.offer_acceptance_rate || 0)) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-primary">{metrics?.offer_acceptance_rate || 0}%</span>
                  <span className="text-xs text-muted-foreground">Accepted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top JDs */}
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Top Performing JDs</CardTitle>
              <CardDescription>By match score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.top_jobs?.map((job, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="min-w-0 max-w-[70%]">
                      <p className="font-medium truncate">{job.job_title}</p>
                      <p className="text-xs text-muted-foreground">{job.candidate_count} candidates</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${job.avg_match_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{job.avg_match_score}</span>
                    </div>
                  </div>
                ))}
                {(!metrics?.top_jobs || metrics.top_jobs.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.recent_activity?.map((activity, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className={`mt-1 h-2 w-2 rounded-full ${activity.type === 'screening' ? 'bg-primary' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!metrics?.recent_activity || metrics.recent_activity.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PrimeLayout>
  );
};

const MetricCard = ({ title, value, trend, subtext, icon: Icon, color }) => (
  <Card className="glass-card hover:border-primary/30 transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">{value}</div>
        {(trend || subtext) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && <span className="text-green-500 font-medium">{trend}</span>}
            {subtext}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default DashboardPrime;
