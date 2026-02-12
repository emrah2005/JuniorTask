import React from 'react';
import Calendar from '../Calendar';
import { useI18n } from '../../contexts/I18nContext';

const CalendarSection = ({ businessId, refreshTrigger }) => {
  const { t } = useI18n();
  if (!businessId) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.calendar.title', 'Booking Calendar')}</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center">
            <p>{t('admin.calendar.selectBusiness', 'Select a business to view calendar')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Calendar businessId={businessId} refreshTrigger={refreshTrigger} />
  );
};

export default CalendarSection;
