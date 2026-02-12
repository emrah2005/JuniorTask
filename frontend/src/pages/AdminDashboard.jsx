import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

// Import modular components
import DashboardLayout from '../components/admin/DashboardLayout';
import StatsSection from '../components/admin/StatsSection';
import BusinessSelector from '../components/admin/BusinessSelector';
import CalendarSection from '../components/admin/CalendarSection';
import PendingBookingsSection from '../components/admin/PendingBookingsSection';
import ChartsSection from '../components/admin/ChartsSection';
import BusinessList from '../components/admin/BusinessList';
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
          fetchBookings()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchDashboardData, fetchBusinesses, fetchBookings]);

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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/groups"
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('sidebar.items.groups', 'Groups')}
          </Link>
          <Link
            to="/tablet"
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('sidebar.items.groups', 'Креирај Група')}
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Business
          </button>
        </div>
      </div>

      {/* Add Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
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
