import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

const BusinessSelector = ({ businesses, selectedBusinessId, onSelectBusiness }) => {
  const { t } = useI18n();
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.selector.title', 'Select Business')}</h3>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={selectedBusinessId || ''}
        onChange={(e) => onSelectBusiness(e.target.value)}
      >
        <option value="">{t('admin.selector.choose', 'Choose a business')}</option>
        {safeBusinesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BusinessSelector;
