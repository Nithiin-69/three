import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import apiClient from '../utils/api';
import { toast } from 'sonner';

const JobFormDialog = ({ open, onOpenChange, job, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: 'Remote',
    employment_type: 'Full-time',
    experience_level: 'Mid',
    description: '',
    requirements: [],
    nice_to_have: [],
    salary_range: {
      min: '',
      max: '',
      currency: 'USD'
    },
    status: 'draft'
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newNiceToHave, setNewNiceToHave] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        location: job.location || 'Remote',
        employment_type: job.employment_type || 'Full-time',
        experience_level: job.experience_level || 'Mid',
        description: job.description || '',
        requirements: job.requirements || [],
        nice_to_have: job.nice_to_have || [],
        salary_range: {
          min: job.salary_range?.min || '',
          max: job.salary_range?.max || '',
          currency: job.salary_range?.currency || 'USD'
        },
        status: job.status || 'draft'
      });
    } else {
      setFormData({
        title: '',
        department: '',
        location: 'Remote',
        employment_type: 'Full-time',
        experience_level: 'Mid',
        description: '',
        requirements: [],
        nice_to_have: [],
        salary_range: {
          min: '',
          max: '',
          currency: 'USD'
        },
        status: 'draft'
      });
    }
  }, [job, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        salary_range: (formData.salary_range.min || formData.salary_range.max) 
          ? {
              min: formData.salary_range.min ? parseInt(formData.salary_range.min) : null,
              max: formData.salary_range.max ? parseInt(formData.salary_range.max) : null,
              currency: formData.salary_range.currency
            }
          : null
      };

      if (job) {
        await apiClient.put(`/jobs/${job.job_id}`, payload);
        toast.success('Job updated successfully');
      } else {
        await apiClient.post('/jobs', payload);
        toast.success('Job created successfully');
      }
      
      onSaved();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(job ? 'Failed to update job' : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addNiceToHave = () => {
    if (newNiceToHave.trim()) {
      setFormData({
        ...formData,
        nice_to_have: [...formData.nice_to_have, newNiceToHave.trim()]
      });
      setNewNiceToHave('');
    }
  };

  const removeNiceToHave = (index) => {
    setFormData({
      ...formData,
      nice_to_have: formData.nice_to_have.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {job ? 'Edit Job Description' : 'Create Job Description'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Senior React Developer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Remote, New York"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select 
                  value={formData.employment_type}
                  onValueChange={(value) => setFormData({...formData, employment_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select 
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData({...formData, experience_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry">Entry</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              rows={6}
              required
            />
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.requirements.length > 0 && (
              <ul className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                    <span className="flex-1 text-sm">{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Nice to Have */}
          <div className="space-y-3">
            <Label>Nice to Have</Label>
            <div className="flex gap-2">
              <Input
                value={newNiceToHave}
                onChange={(e) => setNewNiceToHave(e.target.value)}
                placeholder="Add a nice-to-have skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceToHave())}
              />
              <Button type="button" onClick={addNiceToHave} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.nice_to_have.length > 0 && (
              <ul className="space-y-2">
                {formData.nice_to_have.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                    <span className="flex-1 text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNiceToHave(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Salary Range */}
          <div className="space-y-3">
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary_min" className="text-xs">Minimum</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_range.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    salary_range: {...formData.salary_range, min: e.target.value}
                  })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="salary_max" className="text-xs">Maximum</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_range.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    salary_range: {...formData.salary_range, max: e.target.value}
                  })}
                  placeholder="80000"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-xs">Currency</Label>
                <Select 
                  value={formData.salary_range.currency}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    salary_range: {...formData.salary_range, currency: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="ai-gradient text-white hover:opacity-90"
              disabled={saving}
            >
              {saving ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormDialog;
