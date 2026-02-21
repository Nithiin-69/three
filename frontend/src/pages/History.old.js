import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Eye, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAuthAndLoadScreenings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadScreenings = async () => {
    try {
      const userResponse = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(userResponse.data);
      
      const screeningsResponse = await axios.get(`${API}/screenings`, {
        withCredentials: true
      });
      setScreenings(screeningsResponse.data);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
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

  const getActionBadge = (action) => {
    const variants = {
      'Interview': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: TrendingUp },
      'Maybe': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Minus },
      'Reject': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: TrendingDown }
    };
    
    const variant = variants[action] || variants['Maybe'];
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} border-0 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {action}
      </Badge>
    );
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
    <div className="min-h-screen bg-background">
      <nav className="border-b glass-surface sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Recruit-AI</span>
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
                  onClick={() => navigate('/screening')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Screen Resumes
                </Button>
                <Button 
                  variant="ghost"
                  className="text-foreground font-medium"
                >
                  History
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="ai-gradient text-white">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Screening History</h1>
            <p className="text-lg text-muted-foreground">Review past resume evaluations</p>
          </div>

          {screenings.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No screenings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start screening resumes to see results here
              </p>
              <Button 
                onClick={() => navigate('/screening')}
                className="ai-gradient text-white"
              >
                Screen Resumes
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {screenings.map((screening, index) => (
                <motion.div
                  key={screening.screening_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {screening.candidate_name || screening.filename}
                            </h3>
                            {getActionBadge(screening.recommended_action)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            Applied for: <span className="font-medium text-foreground">{screening.job_title}</span>
                            {screening.job_department && (
                              <span> • {screening.job_department}</span>
                            )}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Overall Match</p>
                              <div className="flex items-center gap-2">
                                <div className={`text-2xl font-bold ${getScoreColor(screening.match_score)}`}>
                                  {screening.match_score}%
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Experience</p>
                              <div className={`text-lg font-semibold ${getScoreColor(screening.experience_score)}`}>
                                {screening.experience_score}%
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Skills</p>
                              <div className={`text-lg font-semibold ${getScoreColor(screening.skills_score)}`}>
                                {screening.skills_score}%
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Keywords</p>
                              <div className={`text-lg font-semibold ${getScoreColor(screening.keyword_score)}`}>
                                {screening.keyword_score}%
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {screening.summary}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => viewDetails(screening.screening_id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedScreening && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedScreening.candidate_name || 'Candidate'} - Detailed Analysis
                </DialogTitle>
                <DialogDescription>
                  Screened for: {selectedScreening.job?.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Score Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className={`text-3xl font-bold mb-1 ${getScoreColor(selectedScreening.match_score)}`}>
                        {selectedScreening.match_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Match</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className={`text-2xl font-bold mb-1 ${getScoreColor(selectedScreening.experience_score)}`}>
                        {selectedScreening.experience_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className={`text-2xl font-bold mb-1 ${getScoreColor(selectedScreening.skills_score)}`}>
                        {selectedScreening.skills_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Skills</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className={`text-2xl font-bold mb-1 ${getScoreColor(selectedScreening.keyword_score)}`}>
                        {selectedScreening.keyword_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Keywords</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendation */}
                <Card className={getScoreBgColor(selectedScreening.match_score)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">Recommended Action</p>
                        <p className="text-2xl font-bold">
                          {selectedScreening.recommended_action}
                        </p>
                      </div>
                      {getActionBadge(selectedScreening.recommended_action)}
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Summary</h3>
                  <p className="text-muted-foreground">{selectedScreening.summary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Strengths</h3>
                  <ul className="space-y-2">
                    {selectedScreening.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                {selectedScreening.gaps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Areas of Concern</h3>
                    <ul className="space-y-2">
                      {selectedScreening.gaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-1">×</span>
                          <span className="text-sm">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Highlights */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Highlights</h3>
                  <ul className="space-y-2">
                    {selectedScreening.key_highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedScreening.detailed_analysis}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
