import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
// import { apiService } from '../services/api';

axios.defaults.baseURL = import.meta?.env?.VITE_API_BASE || '/api';

// Premium calendar styles
const premiumStyles = `
  .premium-calendar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 2px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .premium-calendar-inner {
    background: white;
    border-radius: 18px;
    padding: 24px;
    position: relative;
  }

  .premium-calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
  }

  .premium-calendar-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
  }

  .premium-calendar-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: white;
  }

  .premium-calendar-stats {
    display: flex;
    gap: 24px;
  }

  .premium-stat {
    text-align: center;
  }

  .premium-stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }

  .premium-stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .premium-calendar-legend {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 12px;
  }

  .premium-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #4b5563;
  }

  .premium-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Custom toolbar */
  .premium-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
  }

  .premium-toolbar .btn {
    background: white;
    border: 2px solid #e5e7eb;
    color: #374151;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .premium-toolbar .btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .premium-toolbar .segmented {
    display: inline-flex;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: white;
  }

  .premium-toolbar .segmented .segment {
    padding: 8px 14px;
    font-weight: 700;
    color: #4b5563;
    border-right: 2px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .premium-toolbar .segmented .segment:last-child {
    border-right: none;
  }

  .premium-toolbar .segmented .segment.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-right-color: transparent;
    box-shadow: 0 4px 6px rgba(102,126,234,0.4);
  }

  /* Override react-big-calendar styles */
  .premium-calendar .rbc-toolbar {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin-bottom: 16px !important;
  }

  .premium-calendar .rbc-toolbar button {
    background: white !important;
    border: 2px solid #e5e7eb !important;
    color: #374151 !important;
    padding: 8px 16px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
  }

  .premium-calendar .rbc-toolbar button:hover {
    background: #f9fafb !important;
    border-color: #d1d5db !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .premium-calendar .rbc-toolbar button.rbc-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);
  }

  .premium-calendar .rbc-month-view, 
  .premium-calendar .rbc-agenda-view {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }

  .premium-calendar .rbc-event {
    border-radius: 8px !important;
    border: none !important;
    padding: 4px 8px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.2s ease !important;
  }

  .premium-calendar .rbc-event:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15) !important;
  }

  .premium-calendar .rbc-header {
    background: #f9fafb !important;
    border-bottom: 1px solid #e5e7eb !important;
    padding: 12px !important;
    font-weight: 600 !important;
    color: #374151 !important;
  }

  .premium-calendar .rbc-month-row {
    border-color: #f3f4f6 !important;
  }

  .premium-calendar .rbc-day-bg {
    background: white !important;
  }

  .premium-calendar .rbc-today {
    background: #fef3c7 !important;
  }

  .premium-calendar .rbc-off-range-bg {
    background: #f9fafb !important;
  }

  .premium-calendar .rbc-show-more {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    padding: 2px 8px !important;
  }

  .premium-calendar-empty {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
  }

  .premium-calendar-empty-icon {
    width: 80px;
    height: 80px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .premium-calendar-empty h3 {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .premium-calendar-empty p {
    color: #6b7280;
    margin-bottom: 20px;
  }

  .premium-calendar-tip {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 12px 16px;
    color: #1e40af;
    font-size: 14px;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    animation: modalAppear 0.3s ease-out;
  }

  @keyframes modalAppear {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }

  .modal-close {
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;
  }

  .modal-close:hover {
    background: #e5e7eb;
    color: #1f2937;
  }

  .booking-detail-item {
    display: flex;
    margin-bottom: 16px;
    gap: 12px;
  }

  .booking-detail-icon {
    width: 40px;
    height: 40px;
    background: #f3f4f6;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
  }

  .booking-detail-content h4 {
    font-size: 12px;
    text-transform: uppercase;
    color: #6b7280;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .booking-detail-content p {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-accepted { background: #d1fae5; color: #065f46; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-rejected { background: #fee2e2; color: #991b1b; }
`;

// Clean light calendar styles
const cleanStyles = `
  .clean-calendar-wrap {
    padding: 24px;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
    border-radius: 24px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 6px 18px rgba(9, 23, 41, 0.06);
  }

  .clean-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .clean-title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
  }

  .clean-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .clean-arrow {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .clean-arrow:hover { background: #f9fafb; }

  .clean-select {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 12px;
    font-weight: 600;
    color: #111827;
  }

  .clean-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .clean-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .clean-card .val {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }
  .clean-card .label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
  }

  /* RBC overrides */
  .clean-calendar .rbc-toolbar { display: none; }
  .clean-calendar .rbc-month-view {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #ffffff;
    overflow: hidden;
  }
  .clean-calendar .rbc-header {
    background: #f9fafb;
    padding: 10px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 700;
    color: #374151;
  }
  .clean-calendar .rbc-month-row { border-color: #f3f4f6; }
  .clean-calendar .rbc-date-cell { padding: 6px; }
  .clean-calendar .rbc-event {
    border-radius: 8px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 700;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .clean-calendar .rbc-today { background: #f0f9ff; }
  .clean-calendar .rbc-off-range-bg { background: #fafafa; }
`;
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = ({ businessId, refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const { t } = useI18n();
  const { user } = useAuth();
  // schedule feature removed

  useEffect(() => {
    if (businessId) {
      fetchBookings();
    }
  }, [businessId, refreshTrigger]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/bookings/business/${businessId}`);
      
      if (!response.data || !Array.isArray(response.data)) {
        setEvents([]);
        setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
        return;
      }

      const bookings = response.data
        .filter(booking => booking && booking.id && booking.date && booking.service_name && booking.user_name)
        .map(booking => {
          try {
            const startDate = new Date(booking.date);
            if (isNaN(startDate.getTime())) {
              console.warn('Invalid date for booking:', booking.id);
              return null;
            }
            
            // Calculate end time based on service duration
            let endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
            
            if (booking.service_duration) {
              endDate = new Date(startDate.getTime() + booking.service_duration * 60 * 1000);
            }
            
            return {
              id: booking.id,
              title: `${format(startDate, 'HH:mm')} - ${booking.service_name} (${booking.user_name})`,
              start: startDate,
              end: endDate,
              allDay: false,
              resource: {
                businessId: booking.business_id,
                status: booking.status || 'pending',
                price: booking.service_price || 0,
                duration: booking.service_duration || 60,
                userEmail: booking.user_email || '',
                userName: booking.user_name,
                serviceName: booking.service_name
              }
            };
          } catch (dateError) {
            console.warn('Date parsing error for booking:', booking.id, dateError);
            return null;
          }
        })
        .filter(Boolean); // Remove null entries

      // Calculate stats (only showing accepted bookings)
      const newStats = bookings.reduce((acc, booking) => {
        acc.total++;
        if (booking.resource.status === 'accepted') {
          acc.accepted++;
        }
        return acc;
      }, { total: 0, accepted: 0, pending: 0, rejected: 0 });

      setStats(newStats);
      setEvents(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load calendar data');
      setEvents([]);
      setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Month/Year header controls
  const months = (t('calendar.monthNames') || [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ]);
  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
  const onMonthChange = (idx) => {
    const d = new Date(date);
    d.setMonth(Number(idx));
    setDate(d);
  };
  const onYearChange = (year) => {
    const d = new Date(date);
    d.setFullYear(Number(year));
    setDate(d);
  };
  const goPrev = () => setDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNext = () => setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    const p = event?.resource?.price;
    setPriceInput(p != null ? String(p) : '');
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setPriceInput('');
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const status = event.resource?.status || 'pending';
    let backgroundColor, borderColor, textColor;
    
    switch (status) {
      case 'accepted':
        backgroundColor = isSelected ? '#059669' : '#10b981';
        borderColor = '#047857';
        textColor = 'white';
        break;
      case 'rejected':
        backgroundColor = isSelected ? '#dc2626' : '#ef4444';
        borderColor = '#b91c1c';
        textColor = 'white';
        break;
      case 'pending':
      default:
        backgroundColor = isSelected ? '#f59e0b' : '#fbbf24';
        borderColor = '#d97706';
        textColor = '#78350f';
        break;
    }
    
    const style = {
      backgroundColor: backgroundColor,
      borderRadius: '8px',
      border: `1px solid ${borderColor}`,
      color: textColor,
      fontWeight: '600',
      fontSize: '12px',
      padding: '4px 8px',
      boxShadow: isSelected ? '0 8px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      transform: isSelected ? 'translateY(-2px)' : 'none',
      transition: 'all 0.2s ease-in-out'
    };
    
    return {
      style: style,
      className: 'rbc-event'
    };
  };

  const CustomToolbar = () => null;

  // schedule feature removed

  // schedule feature removed: availability range effect deleted
  if (loading) {
    return (
      <div className="premium-calendar">
        <div className="premium-calendar-inner">
          <div className="premium-calendar-header">
            <div className="premium-calendar-title">
              <div className="premium-calendar-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 1 4 4h8M8 7v10a4 4 0 1-4 4H4a4 4 0 01-4-4V7" />
                </svg>
              </div>
              {t('admin.calendar.title', 'Booking Calendar')}
            </div>
            <div className="premium-calendar-stats">
              <div className="premium-stat">
                <div className="premium-stat-value">-</div>
                <div className="premium-stat-label">{t('admin.stats.totalBookings', 'Total')}</div>
              </div>
              <div className="premium-stat">
                <div className="premium-stat-value">-</div>
                <div className="premium-stat-label">{t('admin.stats.pending', 'Pending')}</div>
              </div>
              <div className="premium-stat">
                <div className="premium-stat-value">-</div>
                <div className="premium-stat-label">{t('admin.stats.accepted', 'Accepted')}</div>
              </div>
            </div>
          </div>
          <div className="premium-calendar-empty">
            <div className="premium-calendar-empty-icon">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <h3>Loading Calendar</h3>
            <p>Fetching your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-calendar">
        <div className="premium-calendar-inner">
          <div className="premium-calendar-header">
            <div className="premium-calendar-title">
              <div className="premium-calendar-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {t('superAdmin.dashboardError', 'Calendar Error')}
            </div>
          </div>
          <div className="premium-calendar-empty">
            <div className="premium-calendar-empty-icon">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>{t('superAdmin.failed', 'Unable to Load Calendar')}</h3>
            <p>{error}</p>
            <button 
              onClick={fetchBookings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('superAdmin.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{premiumStyles}</style>
      <style>{cleanStyles}</style>
      <div className="clean-calendar-wrap">
        <div className="clean-header">
          <div className="clean-title">{t('admin.calendar.title', 'Календар')}</div>
          <div className="clean-controls">
            <button className="clean-arrow" onClick={goPrev} aria-label="Back">
              <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <select className="clean-select" value={date.getMonth()} onChange={(e) => onMonthChange(e.target.value)}>
              {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
            <select className="clean-select" value={date.getFullYear()} onChange={(e) => onYearChange(e.target.value)}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="clean-arrow" onClick={goNext} aria-label="Next">
              <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        {/* schedule controls removed */}

          {events.length === 0 ? (
            <div className="premium-calendar-empty">
              <div className="premium-calendar-empty-icon">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 1 4 4h8M8 7v10a4 4 0 1-4 4H4a4 4 0 01-4-4V7" />
                </svg>
              </div>
              <h3>No Bookings Yet</h3>
              <p>Your calendar will show bookings here once they're created</p>
              <div className="premium-calendar-tip">
                <strong>💡 Tip:</strong> Users can book services from their dashboard, and they'll appear here automatically.
              </div>
            </div>
          ) : (
            <div className="clean-calendar" style={{ height: 600 }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={handleViewChange}
                date={date}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day', 'agenda']}
                selectable={false}
                popup
                components={{
                  toolbar: CustomToolbar
                }}
                eventPropGetter={(event, start, end, isSelected) => eventStyleGetter(event, start, end, isSelected)}
              />
            </div>
          )}
        <div className="clean-stats">
          <div className="clean-card">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none"><path d="M8 7V3a4 4 0 114 4h8M8 7v10a4 4 0 11-4 4H4a4 4 0 01-4-4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <div className="val">{events.filter(e => new Date(e.start).toDateString() === new Date().toDateString()).length}</div>
              <div className="label">{t('admin.stats.today', 'Термини денес')}</div>
            </div>
          </div>
          <div className="clean-card">
            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <div className="val">
                {events
                  .filter(e => new Date(e.start).getMonth() === date.getMonth() && new Date(e.start).getFullYear() === date.getFullYear() && e.resource?.status === 'accepted')
                  .reduce((sum, e) => sum + (parseFloat(e.resource?.price) || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="label">{t('admin.stats.thisMonth', 'Овој месец')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking Details</h2>
              <button className="modal-close" onClick={closeEventModal}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <h4>Customer</h4>
                  <p>{selectedEvent.resource.userName}</p>
                  <span className="text-sm text-gray-500">{selectedEvent.resource.userEmail}</span>
                </div>
              </div>

              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <h4>Service</h4>
                  <p>{selectedEvent.resource.serviceName}</p>
                </div>
              </div>

              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7h8m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <h4>Date & Time</h4>
                  <p>{format(selectedEvent.start, 'EEEE, MMMM do, yyyy')}</p>
                  <p className="text-blue-600 font-bold">
                    {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                    <span className="ml-2 text-sm text-gray-500 font-normal">({selectedEvent.resource.duration} min)</span>
                  </p>
                </div>
              </div>

              <div className="booking-detail-item">
                <div className="booking-detail-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="booking-detail-content">
                  <h4>Status</h4>
                  <span className={`status-badge status-${selectedEvent.resource.status}`}>
                    {selectedEvent.resource.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${selectedEvent.resource.price}
                </div>
                <button 
                  onClick={closeEventModal}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
