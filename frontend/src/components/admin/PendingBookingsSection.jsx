import React from 'react';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

const PendingBookingsSection = ({ bookings, onAcceptBooking, onRejectBooking }) => {
  const { t } = useI18n();
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const pendingBookings = safeBookings.filter(b => b.status === 'pending');

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

  const handleAccept = async (bookingId) => {
    try {
      console.log('Accepting booking:', bookingId, 'with status: accepted');
      await onAcceptBooking(bookingId, 'accepted');
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      console.log('Rejecting booking:', bookingId, 'with status: rejected');
      await onRejectBooking(bookingId, 'rejected');
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
        {t('admin.pending.title', 'Pending Bookings')}
      </h2>
      
      {pendingBookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('admin.pending.empty', 'No pending bookings')}</p>
            <p className="text-sm mt-1">{t('admin.pending.processed', 'All bookings have been processed')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{booking.service_name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">{t('admin.pending.customer', 'Customer')}:</span>
                      <span className="ml-2">{booking.user_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{t('admin.pending.business', 'Business')}:</span>
                      <span className="ml-2">{booking.business_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{t('admin.pending.date', 'Date')}:</span>
                      <span className="ml-2">{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{t('admin.pending.time', 'Time')}:</span>
                      <span className="ml-2">{new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-600">{t('admin.pending.price', 'Price')}: </span>
                    <span className="text-primary-600 font-semibold">${booking.price}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAccept(booking.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center transition-colors"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {t('admin.pending.accept', 'Accept')}
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center transition-colors"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t('admin.pending.reject', 'Reject')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingBookingsSection;
