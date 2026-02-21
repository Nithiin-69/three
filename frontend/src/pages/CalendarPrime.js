import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Calendar as CalendarIcon, Clock, User, MapPin, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import apiClient from '../utils/api';
import PrimeLayout from '../components/PrimeLayout';
import PrimeButton from '../components/PrimeButton';
import LottieLoader from '../components/LottieLoader';

const CalendarPrime = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    attendees: ''
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const response = await apiClient.get('/calendar/events', {
        params: {
          start_date: start.toISOString(),
          end_date: end.toISOString()
        }
      });
      
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event = null, date = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        location: event.location || '',
        attendees: event.attendees?.join(', ') || ''
      });
    } else {
      setEditingEvent(null);
      const dateStr = date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
      setFormData({
        title: '',
        description: '',
        start_datetime: dateStr,
        end_datetime: dateStr,
        location: '',
        attendees: ''
      });
    }
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_datetime: '',
      end_datetime: '',
      location: '',
      attendees: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_datetime) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()) : []
      };

      if (editingEvent) {
        await apiClient.put(`/calendar/events/${editingEvent._id}`, payload);
        toast.success('Event updated successfully');
      } else {
        await apiClient.post('/calendar/events', payload);
        toast.success('Event created successfully');
      }
      
      closeModal();
      loadEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_datetime), date)
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
              <h1 className="text-2xl font-bold text-gradient-gold">Calendar</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                Schedule interviews, manage events, optimize your hiring pipeline.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadEvents}
                className="capsule-hover px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <PrimeButton onClick={() => openModal(null, new Date())}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </PrimeButton>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Month Navigation */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border transition-colors"
                >
                  ← Previous
                </button>
                
                <h2 className="text-2xl font-bold text-foreground">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="px-4 py-2 rounded-full bg-elevated hover:bg-surface border border-border transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card rounded-3xl p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-foreground-secondary">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-4">
                {daysInMonth.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`
                        min-h-[120px] p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                        ${isDayToday 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-elevated border-border hover:border-primary/30'
                        }
                      `}
                      onClick={() => openModal(null, day)}
                    >
                      <div className={`
                        text-sm font-semibold mb-2
                        ${isDayToday ? 'text-primary' : 'text-foreground'}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(event);
                            }}
                            className="p-2 rounded-xl bg-surface/50 hover:bg-surface border border-border text-xs group"
                          >
                            <div className="font-medium text-foreground truncate">
                              {event.title}
                            </div>
                            <div className="text-foreground-muted flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(event.start_datetime), 'HH:mm')}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-primary font-medium">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        <AnimatePresence>
          {showEventModal && (
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
                    {editingEvent ? 'Edit Event' : 'New Event'}
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
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Interview with John Doe"
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.start_datetime}
                        onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.end_datetime}
                        onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event details, agenda, notes..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Conference Room A, Zoom Link"
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Attendees (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      placeholder="e.g. john@example.com, jane@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-elevated border border-border focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <PrimeButton type="submit">
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </PrimeButton>
                    {editingEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(editingEvent._id);
                          closeModal();
                        }}
                        className="px-6 py-2.5 rounded-full border border-danger text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
                      >
                        Delete Event
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-full border border-border hover:bg-elevated transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PrimeLayout>
  );
};

export default CalendarPrime;
