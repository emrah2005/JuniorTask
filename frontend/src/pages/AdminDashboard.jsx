import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, X, Users, Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import axios from 'axios';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Import modular components
import DashboardLayout from '../components/admin/DashboardLayout';
import StatsSection from '../components/admin/StatsSection';
import BusinessSelector from '../components/admin/BusinessSelector';
import CalendarSection from '../components/admin/CalendarSection';
import PendingBookingsSection from '../components/admin/PendingBookingsSection';
import ChartsSection from '../components/admin/ChartsSection';
import BusinessList from '../components/admin/BusinessList';
import ServicesManager from '../components/admin/ServicesManager';
import { apiService } from '../services/api';
import ErrorBoundary from '../components/admin/ErrorBoundary';

const AdminDashboard = () => {
  const { t } = useI18n();
  // State management with safe defaults
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    acceptedBookings: 0
  });
  
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({ 
    name: '', 
    type: 'Barber',
    services: [{ name: '', price: '', duration: '30' }] 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [groupForm, setGroupForm] = useState({ name: '', trainer_id: '', business_id: '', description: '' });
  const [sessionForm, setSessionForm] = useState({ group_id: '', date: '', start_time: '', capacity: 20 });
  const [sessions, setSessions] = useState([]);
  const [sessionModal, setSessionModal] = useState({ open: false, session: null, applications: [], attendance: {} });
  const [calDate, setCalDate] = useState(new Date());
  const [calView, setCalView] = useState('month');
  const CustomAgendaEvent = ({ event }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">
          {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.meta.group_name}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
          {event.meta.used}/{event.meta.capacity}
        </span>
      </div>
      <button
        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => openSessionModal(event)}
      >
        Manage
      </button>
    </div>
  );
  const CustomEvent = ({ event }) => (
    <div className="flex items-center justify-between w-full">
      <span className="truncate">
        {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.meta.group_name}
      </span>
      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
        {event.meta.used}/{event.meta.capacity}
      </span>
    </div>
  );
  const calendarStyles = `
    .rbc-month-view {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(9, 23, 41, 0.04);
    }
    .rbc-header {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .rbc-month-row + .rbc-month-row {
      border-top: 1px solid #eef2f7;
    }
    .rbc-date-cell {
      padding: 6px 8px;
      color: #1f2937;
      font-weight: 600;
    }
    .rbc-today {
      background: #eff6ff;
    }
    .rbc-event {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
      color: #ffffff !important;
      border-radius: 9999px !important;
      border: none !important;
      padding: 2px 8px !important;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      font-weight: 600;
    }
    .rbc-agenda-view table {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .rbc-agenda-view th, .rbc-agenda-view td {
      padding: 10px 12px;
      border-color: #eef2f7;
    }
  `;

  // Calculate real-time chart data from bookings
  const charts = useMemo(() => {
    const filteredBookings = bookings.filter(b => 
      (!selectedBusinessId || b.business_id.toString() === selectedBusinessId) &&
      b.status === 'accepted'
    );

    // Sort by date to ensure charts are chronological
    const sortedBookings = [...filteredBookings].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Revenue Per Service
    const revenueMap = sortedBookings.reduce((acc, b) => {
      acc[b.service_name] = (acc[b.service_name] || 0) + (parseFloat(b.price) || 0);
      return acc;
    }, {});
    const revenuePerService = Object.entries(revenueMap).map(([name, revenue]) => ({ name, revenue }));

    // Bookings Per Month
    const bookingsMap = sortedBookings.reduce((acc, b) => {
      const month = format(new Date(b.date), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const bookingsPerMonth = Object.entries(bookingsMap).map(([month, bookings]) => ({ month, bookings }));

    // Monthly Revenue
    const monthlyRevenueMap = sortedBookings.reduce((acc, b) => {
      const month = format(new Date(b.date), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + (parseFloat(b.price) || 0);
      return acc;
    }, {});
    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue }));

    return {
      revenuePerService,
      bookingsPerMonth,
      monthlyRevenue
    };
  }, [bookings, selectedBusinessId]);

  // Memoized fetch functions to prevent infinite loops
  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await apiService.dashboard.getAdminStats();
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  }, []);

  const fetchBusinesses = useCallback(async () => {
    try {
      const data = await apiService.businesses.getAll();
      if (Array.isArray(data)) {
        setBusinesses(data);
        // Auto-select first business if none selected
        if (data.length > 0) {
          setSelectedBusinessId(prev => {
            if (!prev) {
              const firstId = data[0].id.toString();
              console.log('Auto-selecting first business:', firstId);
              return firstId;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await apiService.bookings.getAll();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    }
  }, []);

  const locales = {};
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

  const loadTrainersAndGroups = useCallback(async () => {
    try {
      const users = await axios.get('/api/users');
      setTrainers(Array.isArray(users.data) ? users.data.filter(u => ['Admin','SuperAdmin'].includes(u.role)) : []);
      const groups = await axios.get('/api/groups');
      setGroupsList(Array.isArray(groups.data) ? groups.data : []);
    } catch (e) {
      console.error('Failed to load trainers/groups', e);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const resp = await axios.get('/api/groups/sessions');
      const rows = Array.isArray(resp.data) ? resp.data : [];
      setSessions(rows.map(r => ({
        id: r.id,
        title: `${new Date(r.session_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${r.group_name}${r.trainer_name ? ` (${r.trainer_name})` : ''}`,
        start: new Date(r.session_datetime),
        end: new Date(new Date(r.session_datetime).getTime() + 60 * 60 * 1000),
        meta: r
      })));
    } catch (e) {
      console.error('Failed to load sessions', e);
      setSessions([]);
    }
  }, []);

  // Safe booking status update
  const handleUpdateBookingStatus = useCallback(async (bookingId, status) => {
    try {
      setError(null);
      await apiService.bookings.updateStatus(bookingId, status);
      
      // Sequential updates to prevent race conditions
      await fetchBookings();
      await fetchDashboardData();
      
      // Trigger calendar refresh
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error('Error updating booking status:', err);
      const errorMessage = err.message || 'Failed to update booking';
      setError(errorMessage);
    }
  }, [fetchBookings, fetchDashboardData]);

  // Business selection handler
  const handleSelectBusiness = useCallback((businessId) => {
    setSelectedBusinessId(businessId);
  }, []);

  const handleAddServiceRow = () => {
    setNewBusiness(prev => ({
      ...prev,
      services: [...prev.services, { name: '', price: '', duration: '30' }]
    }));
  };

  const handleRemoveServiceRow = (index) => {
    setNewBusiness(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setNewBusiness(prev => {
      const updatedServices = [...prev.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return { ...prev, services: updatedServices };
    });
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // 1. Create the business
      const businessResponse = await apiService.businesses.create({
        name: newBusiness.name,
        type: newBusiness.type
      });

      const businessId = businessResponse.business.id;

      // 2. Create services for this business
      const validServices = newBusiness.services.filter(s => s.name && s.price);
      
      if (validServices.length > 0) {
        await Promise.all(validServices.map(service => 
          apiService.services.create({
            business_id: businessId,
            name: service.name,
            price: parseFloat(service.price),
            duration: parseInt(service.duration)
          })
        ));
      }

      setIsModalOpen(false);
      setNewBusiness({ 
        name: '', 
        type: 'Barber',
        services: [{ name: '', price: '', duration: '30' }] 
      });
      
      // Refetch all relevant data
      await Promise.all([
        fetchBusinesses(),
        fetchDashboardData(),
        fetchBookings()
      ]);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchBusinesses(),
          fetchBookings(),
          loadTrainersAndGroups(),
          loadSessions()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchDashboardData, fetchBusinesses, fetchBookings]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: groupForm.name,
        trainer_id: parseInt(groupForm.trainer_id, 10),
        business_id: groupForm.business_id ? parseInt(groupForm.business_id, 10) : null,
        description: groupForm.description
      };
      await axios.post('/api/groups', payload);
      setGroupForm({ name: '', trainer_id: '', business_id: '', description: '' });
      await loadTrainersAndGroups();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        group_id: parseInt(sessionForm.group_id, 10),
        date: sessionForm.date,
        start_time: sessionForm.start_time,
        capacity: parseInt(sessionForm.capacity, 10)
      };
      await axios.post('/api/groups/session', payload);
      setSessionForm({ group_id: '', date: '', start_time: '', capacity: 20 });
      await loadSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create session');
    }
  };

  const openSessionModal = async (event) => {
    const sessionId = event.meta.id;
    try {
      const resp = await axios.get(`/api/groups/session/${sessionId}/applications`);
      const applications = resp.data.applications || [];
      let attendanceMap = {};
      try {
        const att = await axios.get('/api/attendance/session', {
          params: { group_id: resp.data.group_id, session_datetime: resp.data.session_datetime }
        });
        if (Array.isArray(att.data)) {
          attendanceMap = att.data.reduce((acc, row) => {
            acc[row.user_id] = true;
            return acc;
          }, {});
        }
      } catch (e2) {
        console.warn('Attendance fetch failed', e2);
      }
      setSessionModal({ open: true, session: event.meta, applications, attendance: attendanceMap });
    } catch (e) {
      console.error('Failed to load applications', e);
      setSessionModal({ open: true, session: event.meta, applications: [], attendance: {} });
    }
  };

  const handleApprove = async (application_id, action) => {
    if (!sessionModal.session) return;
    try {
      await axios.post(`/api/groups/session/${sessionModal.session.id}/approve`, { application_id, action });
      const resp = await axios.get(`/api/groups/session/${sessionModal.session.id}/applications`);
      setSessionModal(prev => ({ ...prev, applications: resp.data.applications || [] }));
      await loadSessions();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update application');
    }
  };

  const handleAttendance = async (application_id, present, user_id) => {
    if (!sessionModal.session) return;
    try {
      await axios.post(`/api/groups/session/${sessionModal.session.id}/attendance`, { application_id, present });
      setSessionModal(prev => ({
        ...prev,
        attendance: { 
          ...prev.attendance, 
          [user_id]: present ? true : undefined 
        }
      }));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update attendance');
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchDashboardData();
                fetchBusinesses();
                fetchBookings();
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Business
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Group Calendar</h2>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50" onClick={() => setCalDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} aria-label="Prev">
                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-semibold text-gray-800" value={calDate.getMonth()} onChange={(e) => setCalDate(new Date(calDate.getFullYear(), Number(e.target.value), 1))}>
                  {(useI18n().t('calendar.monthNames') || ['January','February','March','April','May','June','July','August','September','October','November','December']).map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-semibold text-gray-800" value={calDate.getFullYear()} onChange={(e) => setCalDate(new Date(Number(e.target.value), calDate.getMonth(), 1))}>
                  {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50" onClick={() => setCalDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} aria-label="Next">
                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden">
                  {['month','week','day','agenda'].map(v => (
                    <button key={v} className={`px-3 py-1 text-sm font-semibold ${calView === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`} onClick={() => setCalView(v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <style>{calendarStyles}</style>
            <RBCalendar
              localizer={localizer}
              events={sessions}
              startAccessor="start"
              endAccessor="end"
              view={calView}
              onView={v => setCalView(v)}
              date={calDate}
              onNavigate={(d) => setCalDate(d)}
              style={{ height: 860 }}
              onSelectEvent={openSessionModal}
              components={{ toolbar: () => null, event: CustomEvent, agenda: { event: CustomAgendaEvent } }}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#10B981',
                  color: 'white',
                  borderRadius: '9999px',
                  border: 'none',
                  padding: '2px 8px'
                }
              })}
            />
          </div>
        </div>
      </div>
      {/* Add Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add New Business</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddBusiness} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {submitError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.businessName', 'Business Name')}</label>
                  <input
                    type="text"
                    required
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={t('admin.businessNamePlaceholder', 'e.g. Master Cuts')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.businessType')}</label>
                  <select
                    value={newBusiness.type}
                    onChange={(e) => setNewBusiness({ ...newBusiness, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Barber">{t('admin.type.barber', 'Barber')}</option>
                    <option value="Gym">{t('admin.type.gym', 'Gym')}</option>
                    <option value="Training Hall">{t('admin.type.trainingHall', 'Training Hall')}</option>
                    <option value="Car Wash">{t('admin.type.carWash', 'Car Wash')}</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('admin.servicesOffered')}</label>
                    <button
                      type="button"
                      onClick={handleAddServiceRow}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Service
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {newBusiness.services.map((service, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                        {newBusiness.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceRow(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <input
                              type="text"
                              required
                              placeholder={t('admin.serviceNamePlaceholder', 'Service Name (e.g. Haircut)')}
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder={t('admin.price')}
                                value={service.price}
                                onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder={t('admin.min')}
                                value={service.duration}
                                onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                className="w-full pr-12 pl-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold uppercase">min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ErrorBoundary>
        {/* Premium Calendar at the top */}
        <div className="mb-8">
          <ErrorBoundary>
            <CalendarSection 
              businessId={selectedBusinessId} 
              refreshTrigger={refreshTrigger} 
            />
          </ErrorBoundary>
        </div>

        {/* Stats Section */}
        <StatsSection stats={stats} />
        
        {/* Business Selector and Business List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary>
            <BusinessSelector 
              businesses={businesses}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={handleSelectBusiness}
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <BusinessList businesses={businesses} />
          </ErrorBoundary>
        </div>

        {/* Services Manager */}
        <div className="mb-8">
          <ErrorBoundary>
            <ServicesManager businessId={selectedBusinessId} />
          </ErrorBoundary>
        </div>

        {/* Groups & Sessions */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Groups & Sessions</h2>
                  <p className="text-sm text-gray-600">Create groups, schedule sessions, and manage applications</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Create Group */}
              <form onSubmit={handleCreateGroup} className="space-y-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-700" />
                  <h3 className="font-semibold text-gray-800">Create Group</h3>
                </div>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Group name"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <label className="block text-xs font-medium text-gray-600">Trainer</label>
                <select
                  value={groupForm.trainer_id}
                  onChange={e => setGroupForm({ ...groupForm, trainer_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select trainer</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="block text-xs font-medium text-gray-600">Business (optional)</label>
                <select
                  value={groupForm.business_id}
                  onChange={e => setGroupForm({ ...groupForm, business_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select business</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <label className="block text-xs font-medium text-gray-600">Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Description"
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create Group</button>
              </form>

              {/* Create Session */}
              <form onSubmit={handleCreateSession} className="space-y-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-gray-700" />
                  <h3 className="font-semibold text-gray-800">Create Session</h3>
                </div>
                <label className="block text-xs font-medium text-gray-600">Group</label>
                <select
                  value={sessionForm.group_id}
                  onChange={e => setSessionForm({ ...sessionForm, group_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select group</option>
                  {groupsList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <label className="block text-xs font-medium text-gray-600">Date</label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <label className="block text-xs font-medium text-gray-600">Start Time</label>
                <input
                  type="time"
                  value={sessionForm.start_time}
                  onChange={e => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <label className="block text-xs font-medium text-gray-600">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={sessionForm.capacity}
                  onChange={e => setSessionForm({ ...sessionForm, capacity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Capacity"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create Session</button>
              </form>

              
            </div>
          </div>
        </div>

        {/* Admin Modal – Session Details */}
        {sessionModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">
                  {sessionModal.session?.group_name} • {new Date(sessionModal.session?.session_datetime).toLocaleString()}
                </h3>
                <button onClick={() => setSessionModal({ open: false, session: null, applications: [] })} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    Capacity {sessionModal.session?.used}/{sessionModal.session?.capacity}
                  </span>
                  <span className="text-gray-500 text-sm">{new Date(sessionModal.session?.session_datetime).toLocaleString()}</span>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">User</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                      <th className="p-2">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionModal.applications.map(app => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{app.user_name}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-2 space-x-2">
                          <button onClick={() => handleApprove(app.id, 'approve')} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => handleApprove(app.id, 'reject')} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                        </td>
                        <td className="p-2">
                          <input 
                            type="checkbox" 
                            checked={!!sessionModal.attendance[app.user_id]} 
                            disabled={app.status !== 'confirmed'}
                            onChange={e => handleAttendance(app.id, e.target.checked, app.user_id)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pending Bookings */}
        <div className="mb-8">
          <ErrorBoundary>
            <PendingBookingsSection 
              bookings={bookings}
              onAcceptBooking={handleUpdateBookingStatus}
              onRejectBooking={handleUpdateBookingStatus}
            />
          </ErrorBoundary>
        </div>

        {/* Charts */}
        <ErrorBoundary>
          <ChartsSection charts={charts} />
        </ErrorBoundary>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default AdminDashboard;
