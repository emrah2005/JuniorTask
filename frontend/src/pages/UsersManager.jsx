import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { apiService } from '../services/api';

const UsersManager = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);

  const canList = user?.role === 'SuperAdmin';

  const loadUsers = async () => {
    if (!canList) return;
    const data = await apiService.users.getAll();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, [canList]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiService.users.create({ name, email, password, role });
      setSuccess(t('users.created', 'Корисникот е креиран'));
      setName(''); setEmail(''); setPassword(''); setRole('User');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('users.title', 'Корисници')}</h1>
      <div className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">{t('users.create', 'Креирај корисник')}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{success}</div>}
        <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t('auth.fields.name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder={t('auth.placeholders.name')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.fields.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder={t('auth.placeholders.email')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.fields.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder={t('auth.placeholders.password')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.register.roleLabel')}</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="User">{t('auth.register.roleUser')}</option>
              <option value="Admin">{t('auth.register.roleAdmin')}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{t('auth.register.submit')}</button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">{t('users.list', 'Листа на корисници')}</h2>
        {!canList && <div className="text-gray-600">{t('users.noAccess', 'Само SuperAdmin може да ја види листата')}</div>}
        {canList && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">ID</th>
                  <th className="p-2">{t('auth.fields.name')}</th>
                  <th className="p-2">{t('auth.fields.email')}</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{new Date(u.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td className="p-2 text-gray-500" colSpan="5">{t('users.empty', 'Нема корисници')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManager;

