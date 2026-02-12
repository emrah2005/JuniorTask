import React from 'react';
import { DollarSign, TrendingUp, Calendar as CalendarIcon, Building } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

const StatsSection = ({ stats }) => {
  const { t } = useI18n();
  const safeStats = {
    totalRevenue: stats?.totalRevenue || 0,
    monthlyRevenue: stats?.monthlyRevenue || 0,
    totalBookings: stats?.totalBookings || 0,
    acceptedBookings: stats?.acceptedBookings || 0
  };

  const statCards = [
    {
      title: t('admin.stats.totalRevenue', 'Total Revenue'),
      value: safeStats.totalRevenue,
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      format: 'currency'
    },
    {
      title: t('admin.stats.monthlyRevenue', 'Monthly Revenue'),
      value: safeStats.monthlyRevenue,
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      format: 'currency'
    },
    {
      title: t('admin.stats.totalBookings', 'Total Bookings'),
      value: safeStats.totalBookings,
      icon: CalendarIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      format: 'count'
    },
    {
      title: t('admin.stats.accepted', 'Accepted'),
      value: safeStats.acceptedBookings,
      icon: Building,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      format: 'count'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className={`${stat.bgColor} rounded-xl p-3`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.format === 'currency'
                  ? `$${Number(stat.value).toFixed(2)}`
                  : `${Number(stat.value)}`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
