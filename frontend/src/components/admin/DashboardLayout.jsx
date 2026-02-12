import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

const DashboardLayout = ({ children }) => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboardTitle', 'Admin Dashboard')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.dashboardSubtitle', 'Manage your businesses and bookings')}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
