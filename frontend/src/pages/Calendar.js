import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, Trash2, Edit2, Home, Sparkles, X, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'interview',
    start_datetime: '',
    end_datetime: '',
    location: '',
    candidate_name: '',
    candidate_email: '',
    status: 'scheduled',
    color_tag: 'blue'
  });

  const loadEvents = useCallback(async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await apiClient.get('/calendar/events', {
        params: {
          start_date: startOfMonth.toISOString(),
          end_date: endOfMonth.toISOString()
        }
      });
      
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load calendar events');
    }
  }, [currentDate, view]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async () => {
    try {
      await apiClient.post('/calendar/events', formData);
      toast.success('Event created successfully');
      setIsDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await apiClient.put(`/calendar/events/${selectedEvent.event_id}`, formData);
      toast.success('Event updated successfully');
      setIsDialogOpen(false);
      setIsEditMode(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
      toast.success('Event deleted successfully');
      setSelectedEvent(null);
      setIsDialogOpen(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'interview',
      start_datetime: '',
      end_datetime: '',
      location: '',
      candidate_name: '',
      candidate_email: '',
      status: 'scheduled',
      color_tag: 'blue'
    });
    setSelectedEvent(null);
    setSelectedDate(null);
    setIsEditMode(false);
  };

  const openCreateDialog = (date = null) => {
    resetForm();
    if (date) {
      const dateStr = date.toISOString().slice(0, 16);
      setFormData(prev => ({
        ...prev,
        start_datetime: dateStr,
        end_datetime: dateStr
      }));
      setSelectedDate(date);
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_datetime: event.start_datetime.slice(0, 16),
      end_datetime: event.end_datetime.slice(0, 16),
      location: event.location || '',
      candidate_name: event.candidate_name || '',
      candidate_email: event.candidate_email || '',
      status: event.status,
      color_tag: event.color_tag
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const colorTagStyles = {
    blue: 'bg-primary/15 border-primary text-primary',
    green: 'bg-success/15 border-success text-success',
    red: 'bg-destructive/15 border-destructive text-destructive',
    purple: 'bg-accent/15 border-accent text-accent',
    yellow: 'bg-warning/15 border-warning text-warning',
  };

  const statusColors = {
    scheduled: 'text-primary',
    completed: 'text-success',
    cancelled: 'text-destructive',
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh-ios opacity-20 pointer-events-none" />

      {/* iOS Navigation */}
      <motion.nav 
        className="glass-nav sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="relative group">
                  <div className="w-11 h-11 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2 transition-all duration-300 group-hover:shadow-depth-3 group-hover:scale-105">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl gradient-ios-blue opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
                </div>
                <span className="text-2xl font-bold tracking-tightest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  AIRecruiter
                </span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="tracking-apple rounded-xl">Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/jobs')} className="tracking-apple rounded-xl">Jobs</Button>
                <Button variant="ghost" onClick={() => navigate('/screening')} className="tracking-apple rounded-xl">Screening</Button>
                <Button variant="ghost" onClick={() => navigate('/history')} className="tracking-apple rounded-xl">History</Button>
                <Button variant="ghost" className="text-foreground font-semibold tracking-apple rounded-xl">Calendar</Button>
                <Button variant="ghost" onClick={() => navigate('/emails')} className="tracking-apple rounded-xl">Emails</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold tracking-tightest mb-2">Calendar</h1>
          <p className="text-xl text-muted-foreground tracking-apple">Manage your interview schedule</p>
        </motion.div>

        {/* Calendar Container - macOS Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden"
        >
          
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold tracking-tightest">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMonth}
                  className="h-10 w-10 rounded-xl hover:bg-secondary"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMonth}
                  className="h-10 w-10 rounded-xl hover:bg-secondary"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={goToToday}
                variant="ghost"
                className="rounded-xl tracking-apple"
              >
                Today
              </Button>
              
              <Button
                onClick={() => openCreateDialog()}
                className="ios-button-primary shadow-depth-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          {/* Calendar Grid - macOS Style */}
          <div className="p-6">
            
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center py-3">
                  <span className="text-sm font-semibold text-muted-foreground tracking-apple">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden">
              {days.map((day, idx) => {
                const dayEvents = getEventsForDate(day.fullDate);
                const isToday = day.fullDate.toDateString() === new Date().toDateString();
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.005 }}
                    onClick={() => day.isCurrentMonth && openCreateDialog(day.fullDate)}
                    className={`
                      min-h-[120px] p-3 bg-card cursor-pointer group
                      hover:bg-secondary/50 transition-colors duration-200
                      ${!day.isCurrentMonth ? 'opacity-40' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-semibold mb-2 flex items-center justify-between
                      ${isToday ? 'text-primary' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      <span className={isToday ? 'w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center' : ''}>
                        {day.date}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, eventIdx) => (
                        <motion.div
                          key={eventIdx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ 
                            opacity: 0.85,
                            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
                            transition: { duration: 0.2, ease: "easeInOut" }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(event);
                          }}
                          className={`
                            text-xs px-2 py-1.5 rounded-lg border
                            ${colorTagStyles[event.color_tag] || colorTagStyles.blue}
                            font-medium tracking-apple cursor-pointer
                            transition-all duration-200 ease-in-out
                          `}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </motion.div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-2 tracking-apple">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </main>

      {/* Event Dialog - Enhanced Width & Responsive */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="glass-card-dialog border-2 border-border shadow-depth-4 max-w-3xl w-full mx-4 sm:mx-auto sm:w-[700px]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {isEditMode ? 'Edit Event' : 'New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-apple">Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Interview with candidate"
                className="ios-input h-10"
              />
            </div>

            {/* Type, Status, Color - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Type</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger className="ios-input h-10 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-2 border-border">
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="ios-input h-10 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-2 border-border">
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {['blue', 'green', 'red', 'purple', 'yellow'].map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color_tag: color })}
                      className={`
                        w-8 h-8 rounded-lg border transition-all duration-200 flex-shrink-0
                        ${formData.color_tag === color ? 'border-foreground scale-110 ring-2 ring-offset-1 ring-foreground' : 'border-border'}
                        ${color === 'blue' ? 'bg-primary' : ''}
                        ${color === 'green' ? 'bg-success' : ''}
                        ${color === 'red' ? 'bg-destructive' : ''}
                        ${color === 'purple' ? 'bg-accent' : ''}
                        ${color === 'yellow' ? 'bg-warning' : ''}
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Time - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                  className="ios-input h-10 text-sm w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">End</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  className="ios-input h-10 text-sm w-full"
                />
              </div>
            </div>

            {/* Candidate Details - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Candidate Name</Label>
                <Input
                  value={formData.candidate_name}
                  onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                  placeholder="John Doe"
                  className="ios-input h-10 text-sm w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-apple">Email</Label>
                <Input
                  type="email"
                  value={formData.candidate_email}
                  onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                  placeholder="john@example.com"
                  className="ios-input h-10 text-sm w-full"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-apple">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Zoom, Office, etc."
                className="ios-input h-10 text-sm w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-apple">Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes..."
                className="ios-textarea text-sm w-full"
                rows={3}
              />
            </div>
          </div>

          {/* Actions - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3 border-t border-border">
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteEvent(selectedEvent.event_id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-10 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto w-full sm:w-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="rounded-lg h-10 flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={isEditMode ? handleUpdateEvent : handleCreateEvent}
                className="ios-button-primary shadow-depth-2 h-10 flex-1 sm:flex-none"
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Calendar;
