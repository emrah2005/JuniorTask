import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

const BusinessList = ({ businesses }) => {
  const { t } = useI18n();
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.businessList.title', 'Your Businesses')}</h3>
      
      {safeBusinesses.length === 0 ? (
        <p className="text-gray-500">{t('admin.businessList.empty', 'No businesses yet.')}</p>
      ) : (
        <div className="space-y-2">
          {safeBusinesses.map((business) => (
            <div key={business.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{business.name}</h4>
                  <p className="text-xs text-gray-600">{business.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessList;
