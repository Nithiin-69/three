import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import LottieLoader from '../components/LottieLoader';

const JobsPrime = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewMode, setViewMode] = useState(false); // true = read-only, false = editable
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    status: 'active'
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const openModal = (job = null, isViewMode = false) => {
    if (job) {
      setEditingJob(job);
      setViewMode(isViewMode);
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        status: job.status
      });
    } else {
      setEditingJob(null);
      setViewMode(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setViewMode(false);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      status: 'active'
    });
  };
      title: '',
      description: '',
      requirements: '',
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingJob) {
        await apiClient.put(`/jobs/${editingJob._id}`, formData);
        toast.success('Job updated successfully');
      } else {
        await apiClient.post('/jobs', formData);
        toast.success('Job created successfully');
      }
      
      closeModal();
      loadJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await apiClient.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-gradient-gold">Job Openings</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                {jobs.length} position{jobs.length !== 1 ? 's' : ''} available. Let's fill them with prime talent.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadJobs}
                className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <PrimeButton onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                New Job Opening
              </PrimeButton>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border bg-surface/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-elevated border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="p-6">
          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-foreground-muted" />
              </div>
              <p className="text-foreground-secondary">No jobs found</p>
              <p className="text-sm text-foreground-muted mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Create your first job opening'}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-3xl p-6 hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{job.title}</h3>
                    <span className={`capsule-status border ${
                      job.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <button className="p-2 hover:bg-elevated rounded-full transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <div className="
                      absolute right-0 top-full mt-2 w-40 
                      frosted-panel rounded-2xl border border-border
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 z-10
                    ">
                      <button
                        onClick={() => openModal(job)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-elevated rounded-t-2xl flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-elevated rounded-b-2xl flex items-center gap-2 text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-foreground-secondary line-clamp-3 mb-4">
                  {job.description}
                </p>
                
                {job.requirements && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-foreground-muted">Requirements:</p>
                    <p className="text-sm text-foreground-secondary line-clamp-2 mt-1">
                      {job.requirements}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openModal(job, true)}
                    className="flex-1 px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => openModal(job, false)}
                    className="flex-1 px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Job Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card-static rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-custom"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {viewMode ? 'View Job' : editingJob ? 'Edit Job' : 'Create New Job'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-elevated rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Senior Full Stack Developer"
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                      required
                      readOnly={viewMode}
                      disabled={viewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none resize-none"
                      required
                      readOnly={viewMode}
                      disabled={viewMode}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Requirements (Optional)
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="List specific requirements, skills, experience..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none resize-none"
                      readOnly={viewMode}
                      disabled={viewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none cursor-pointer"
                      disabled={viewMode}
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {!viewMode && (
                    <div className="flex gap-3 pt-4">
                      <PrimeButton type="submit">
                        {editingJob ? 'Update Job' : 'Create Job'}
                      </PrimeButton>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2.5 rounded-full border border-border hover:bg-elevated transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PrimeLayout>
  );
};

export default JobsPrime;
