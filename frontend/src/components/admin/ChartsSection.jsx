import React from 'react';
import { BarChart3, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useI18n } from '../../contexts/I18nContext';

const ChartsSection = ({ charts }) => {
  const { t } = useI18n();
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  const safeCharts = {
    monthlyRevenue: Array.isArray(charts?.monthlyRevenue) ? charts.monthlyRevenue : [],
    revenuePerService: Array.isArray(charts?.revenuePerService) ? charts.revenuePerService : [],
    bookingsPerMonth: Array.isArray(charts?.bookingsPerMonth) ? charts.bookingsPerMonth : []
  };

  const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-2xl rounded-xl border border-gray-100 backdrop-blur-md bg-opacity-90">
          <p className="text-sm font-bold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <p className="text-sm font-medium text-gray-600">
                {entry.name}: <span className="text-gray-900 font-bold">{prefix}{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMonthlyRevenueChart = () => {
    if (safeCharts.monthlyRevenue.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-200" />
            </div>
            <p className="font-medium">{t('admin.charts.noRevenue', 'No revenue data')}</p>
            <p className="text-xs mt-1 text-gray-400">{t('admin.charts.acceptBookings', 'Accept bookings to see trends')}</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={safeCharts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip prefix="$" />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            name={t('admin.charts.revenue', 'Revenue')}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderRevenuePerServiceChart = () => {
    if (safeCharts.revenuePerService.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-200" />
            </div>
            <p className="font-medium">{t('admin.charts.noService', 'No service data')}</p>
            <p className="text-xs mt-1 text-gray-400">{t('admin.charts.completeBookings', 'Complete bookings to see performance')}</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={safeCharts.revenuePerService}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="revenue"
          >
            {safeCharts.revenuePerService.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip prefix="$" />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBookingsPerMonthChart = () => {
    if (safeCharts.bookingsPerMonth.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-200" />
            </div>
            <p className="font-medium">{t('admin.charts.noBookingTrends', 'No booking trends')}</p>
            <p className="text-xs mt-1 text-gray-400">{t('admin.charts.moreData', 'More data needed for analysis')}</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={safeCharts.bookingsPerMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar 
            dataKey="bookings" 
            fill="url(#colorBookings)" 
            name={t('admin.charts.bookings', 'Bookings')} 
            radius={[6, 6, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">{t('admin.charts.monthlyRevenueTitle', 'Monthly Revenue')}</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {t('admin.charts.realTime', 'Real-time')}
          </span>
        </div>
        {renderMonthlyRevenueChart()}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">{t('admin.charts.serviceShareTitle', 'Service Share')}</h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {t('admin.charts.byRevenue', 'By Revenue')}
          </span>
        </div>
        {renderRevenuePerServiceChart()}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">{t('admin.charts.bookingVolumeTitle', 'Booking Volume')}</h2>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {t('admin.charts.trends', 'Trends')}
          </span>
        </div>
        {renderBookingsPerMonthChart()}
      </div>
    </div>
  );
};

export default ChartsSection;
