import React, { useMemo, useState } from 'react';
import { useDashboardStats, useBusinesses, useBookings } from '../hooks/useApi';
import apiService from '../services/api';
import { formatCurrency, formatNumber, getStatusColor } from '../utils/helpers';
import { Users, Building, Calendar, DollarSign, TrendingUp, BarChart3, Plus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useI18n } from '../contexts/I18nContext';

const SuperAdmin = () => {
  const { t } = useI18n();
  const { data: dashboardData, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats('SuperAdmin');
  const { data: businesses, loading: businessesLoading, error: businessesError, refetch: refetchBusinesses } = useBusinesses();
  const { data: bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({ name: '', type: 'Barber' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Calculate derived stats
  const derivedStats = useMemo(() => {
    if (!Array.isArray(bookings)) return { acceptedBookings: 0, pendingBookings: 0, rejectedBookings: 0, totalRevenue: 0 };
    
    return {
      acceptedBookings: bookings.filter(b => b?.status === 'accepted').length,
      pendingBookings: bookings.filter(b => b?.status === 'pending').length,
      rejectedBookings: bookings.filter(b => b?.status === 'rejected').length,
      totalRevenue: bookings.filter(b => b?.status === 'accepted').reduce((sum, b) => sum + (parseFloat(b?.price) || 0), 0)
    };
  }, [bookings]);

  const isLoading = statsLoading || businessesLoading || bookingsLoading;
  const hasError = statsError || businessesError || bookingsError;

  const handleRetry = () => {
    window.location.reload();
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiService.businesses.create(newBusiness);
      setIsModalOpen(false);
      setNewBusiness({ name: '', type: 'Barber' });
      // Refetch data
      refetchStats();
      refetchBusinesses();
      refetchBookings();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('superAdmin.loading', 'Loading SuperAdmin dashboard...')}</p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-xs text-gray-400">
            <p>Stats: {statsLoading ? '⌛ Loading' : '✅ Done'}</p>
            <p>Businesses: {businessesLoading ? '⌛ Loading' : '✅ Done'}</p>
            <p>Bookings: {bookingsLoading ? '⌛ Loading' : '✅ Done'}</p>
          </div>
        </div>
        
        {/* Fail-safe button if stuck */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-10 text-sm text-blue-600 hover:underline"
        >
          Taking too long? Click here to refresh
        </button>
      </div>
    );
  }

  if (hasError) {
    console.error('SuperAdmin Dashboard Errors:', { statsError, businessesError, bookingsError });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('superAdmin.dashboardError')}</h3>
            <p className="text-gray-600 mb-6">
              {statsError || businessesError || bookingsError || t('superAdmin.failed', 'Failed to load dashboard data')}
            </p>
            
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('superAdmin.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const stats = dashboardData?.stats;
  const charts = dashboardData?.charts;

  // Add more granular checks for stats cards
  const totalUsers = stats?.totalUsers ?? 0;
  const totalBusinesses = stats?.totalBusinesses ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const totalRevenue = parseFloat(stats?.totalRevenue) || 0;

  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-4 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-semibold text-gray-700">{entry.name}:</span>
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatter ? formatter(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('superAdmin.title', 'SuperAdmin Dashboard')}</h1>
            <p className="text-gray-600 mt-2">{t('superAdmin.subtitle', 'Global system overview and statistics')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('superAdmin.addBusiness', 'Add Business')}
          </button>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={newBusiness.name}
                      onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Master Cuts"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={newBusiness.type}
                      onChange={(e) => setNewBusiness({ ...newBusiness, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Barber">Barber</option>
                      <option value="Gym">Gym</option>
                      <option value="Training Hall">Training Hall</option>
                      <option value="Car Wash">Car Wash</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 flex space-x-3">
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
                    className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {isSubmitting ? 'Adding...' : 'Add Business'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{formatNumber(totalUsers)}</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 group-hover:bg-blue-600 group-hover:rotate-12 transition-all duration-300">
                <Users className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Businesses</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{formatNumber(totalBusinesses)}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 group-hover:bg-emerald-600 group-hover:rotate-12 transition-all duration-300">
                <Building className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5 new this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{formatNumber(totalBookings)}</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 group-hover:bg-purple-600 group-hover:rotate-12 transition-all duration-300">
                <Calendar className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-600 font-medium">
              <BarChart3 className="w-3 h-3 mr-1" />
              <span>{derivedStats.pendingBookings} pending approval</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 group-hover:bg-amber-600 group-hover:rotate-12 transition-all duration-300">
                <DollarSign className="w-6 h-6 text-amber-600 group-hover:text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+18.4% growth</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded-lg mr-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t('superAdmin.revenueGrowth')}</h2>
                  <p className="text-xs text-gray-500">{t('superAdmin.monthlyRevenueTrends')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('superAdmin.totalLifetime')}</p>
              </div>
            </div>
            {charts?.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 500}}
                    dy={10}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('default', { month: 'short' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 500}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatCurrency} />}
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue"
                    animationDuration={2000}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('superAdmin.noRevenueData')}</p>
                  <p className="text-sm text-gray-400">Accept bookings to see revenue trends</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="bg-emerald-50 p-2 rounded-lg mr-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t('superAdmin.bookingVolume')}</h2>
                  <p className="text-xs text-gray-500">{t('superAdmin.monthlyBookingActivity')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">{formatNumber(totalBookings)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('superAdmin.totalLifetime')}</p>
              </div>
            </div>
            {charts?.monthlyBookings?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.monthlyBookings}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 500}}
                    dy={10}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('default', { month: 'short' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 500}}
                  />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                    name="Bookings"
                    animationDuration={2000}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('superAdmin.noBookingData')}</p>
                  <p className="text-sm text-gray-400">Accept bookings to see booking trends</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Businesses Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-gray-600">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('superAdmin.systemBusinesses')}</h2>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {Array.isArray(businesses) ? businesses.length : 0} {t('superAdmin.totalLabel')}
            </span>
          </div>
          <div className="p-8">
            {!Array.isArray(businesses) || businesses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No businesses registered yet</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  Create your first business →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div key={business?.id} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${
                          business?.type === 'Barber' ? 'bg-amber-50 text-amber-600' :
                          business?.type === 'Gym' ? 'bg-red-50 text-red-600' :
                          business?.type === 'Car Wash' ? 'bg-blue-50 text-blue-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                          ID: {business?.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{business?.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{business?.type}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Users className="w-3 h-3 mr-1" />
                        <span>Owner: {business?.owner_name || 'System Admin'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Bookings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-gray-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('superAdmin.latest20Bookings')}
            </span>
          </div>
          <div className="overflow-x-auto">
            {!Array.isArray(bookings) || bookings.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">{t('superAdmin.noBookingsFound')}</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Business</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Service</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {bookings.slice(0, 20).map((booking) => (
                    <tr key={booking?.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">#{booking?.id}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 mr-3 border border-gray-200 uppercase">
                            {booking?.user_name?.charAt(0) || 'U'}
                          </div>
                          <div className="text-sm font-medium text-gray-700">{booking?.user_name}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking?.business_name}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{booking?.business_type}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-700">{booking?.service_name}</div>
                        <div className="text-xs text-gray-500">{new Date(booking?.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(booking?.status)}`}>
                          {booking?.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
