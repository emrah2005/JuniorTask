import React, { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { apiService } from '../../services/api';

const ServicesManager = ({ businessId }) => {
  const { t } = useI18n();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newService, setNewService] = useState({ name: '', price: '', duration: '30' });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', duration: '30' });

  const load = async () => {
    if (!businessId) {
      setServices([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiService.services.getByBusiness(businessId);
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [businessId]);

  const addService = async (e) => {
    e.preventDefault();
    setError('');
    if (!newService.name || !newService.price) return;
    try {
      await apiService.services.create({
        business_id: Number(businessId),
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration)
      });
      setNewService({ name: '', price: '', duration: '30' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (svc) => {
    setEditing(svc.id);
    setEditData({
      name: svc.name,
      price: String(svc.price),
      duration: String(svc.duration)
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData({ name: '', price: '', duration: '30' });
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      await apiService.services.update(id, {
        name: editData.name,
        price: parseFloat(editData.price),
        duration: parseInt(editData.duration)
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeService = async (id) => {
    setError('');
    try {
      await apiService.services.delete(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.servicesManager.title', 'Services')}</h3>
      {!businessId && <div className="text-gray-500">{t('admin.servicesManager.select', 'Select a business to manage services')}</div>}
      {businessId && (
        <>
          {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={addService} className="grid md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder={t('admin.serviceNamePlaceholder', 'Service Name')}
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={t('admin.price', 'Price')}
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder={t('admin.min', 'Min')}
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{t('admin.addService', 'Add')}</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">ID</th>
                  <th className="p-2">{t('admin.serviceName', 'Name')}</th>
                  <th className="p-2">{t('admin.price', 'Price')}</th>
                  <th className="p-2">{t('admin.duration', 'Duration')}</th>
                  <th className="p-2">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="p-2 text-gray-500" colSpan="5">{t('common.loading', 'Loading...')}</td></tr>
                )}
                {!loading && services.length === 0 && (
                  <tr><td className="p-2 text-gray-500" colSpan="5">{t('admin.servicesManager.empty', 'No services')}</td></tr>
                )}
                {!loading && services.map(svc => (
                  <tr key={svc.id} className="border-b">
                    <td className="p-2">{svc.id}</td>
                    <td className="p-2">
                      {editing === svc.id ? (
                        <input
                          className="border rounded-lg px-2 py-1 w-full"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : svc.name}
                    </td>
                    <td className="p-2">
                      {editing === svc.id ? (
                        <input
                          type="number"
                          className="border rounded-lg px-2 py-1 w-full"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        />
                      ) : svc.price}
                    </td>
                    <td className="p-2">
                      {editing === svc.id ? (
                        <input
                          type="number"
                          className="border rounded-lg px-2 py-1 w-full"
                          value={editData.duration}
                          onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                        />
                      ) : `${svc.duration} min`}
                    </td>
                    <td className="p-2">
                      {editing === svc.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(svc.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg">{t('common.save', 'Save')}</button>
                          <button onClick={cancelEdit} className="px-3 py-1 border rounded-lg">{t('common.cancel', 'Cancel')}</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(svc)} className="px-3 py-1 border rounded-lg">{t('common.edit', 'Edit')}</button>
                          <button onClick={() => removeService(svc.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg">{t('common.delete', 'Delete')}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesManager;
