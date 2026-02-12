import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, DollarSign, MapPin, X, Search } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

axios.defaults.baseURL = import.meta?.env?.VITE_API_BASE || '/api';

const UserDashboard = () => {
  const { t } = useI18n();
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, total: 0, accepted: 0, pending: 0 });
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchServices(selectedBusiness);
    }
  }, [selectedBusiness]);

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get('/api/businesses');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (businessId) => {
    try {
      const response = await axios.get(`/api/services/business/${businessId}`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await axios.get('/api/dashboard/user');
      const arr = Array.isArray(response.data.bookings) ? response.data.bookings : [];
      setMyBookings(arr);
      const total = arr.length;
      const accepted = arr.filter(b => b.status === 'accepted').length;
      const pending = arr.filter(b => b.status === 'pending').length;
      const totalSpent = arr
        .filter(b => b.status === 'accepted')
        .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
      setStats({ totalSpent, total, accepted, pending });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    const dateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    try {
      await axios.post('/api/bookings', {
        business_id: selectedBusiness,
        service_id: selectedService,
        date: dateTime.toISOString()
      });
      
      setShowBookingForm(false);
      setSelectedBusiness('');
      setSelectedService('');
      setBookingDate('');
      setBookingTime('');
      fetchMyBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`);
        fetchMyBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('userDashboard.loading', 'Loading dashboard...')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('userDashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('userDashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="text-sm font-semibold text-gray-500">{t('userDashboard.totalSpent', 'Total Spent')}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="text-sm font-semibold text-gray-500">{t('userDashboard.totalBookings', 'Bookings')}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="text-sm font-semibold text-gray-500">{t('userDashboard.accepted', 'Accepted')}</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.accepted}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="text-sm font-semibold text-gray-500">{t('userDashboard.pending', 'Pending')}</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Businesses and Booking */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('userDashboard.availableBusinesses')}</h2>
              <button
                onClick={() => setShowBookingForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                {t('userDashboard.bookAppointment')}
              </button>
            </div>
            
            {businesses.length === 0 ? (
              <p className="text-gray-500">{t('userDashboard.noBusinesses')}</p>
            ) : (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div key={business.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.type}</p>
                        <p className="text-sm text-gray-500 mt-1">Owner: {business.owner_name}</p>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">View Services</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('userDashboard.myBookings')}</h2>
            
            {myBookings.length === 0 ? (
              <p className="text-gray-500">{t('userDashboard.noBookings')}</p>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.business_name}</h3>
                        <p className="text-sm text-gray-600">{booking.service_name}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${booking.price}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            {t('userDashboard.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('userDashboard.bookAppointment')}</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('userDashboard.selectBusiness')}</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={selectedBusiness}
                  onChange={(e) => {
                    setSelectedBusiness(e.target.value);
                    setSelectedService('');
                  }}
                >
                  <option value="">{t('userDashboard.chooseBusiness')}</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name} - {business.type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBusiness && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('userDashboard.selectService')}</label>
                  <select
                    required
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="">{t('userDashboard.chooseService')}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price} ({service.duration}min)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('userDashboard.date')}</label>
                <input
                  type="date"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('userDashboard.time')}</label>
                <input
                  type="time"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex-1"
                >
                  {t('userDashboard.bookNow')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  {t('userDashboard.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
