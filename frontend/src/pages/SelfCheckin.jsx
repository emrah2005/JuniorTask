import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { apiService } from '../services/api';

const SelfCheckin = () => {
  const { t } = useI18n();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sessionDatetime, setSessionDatetime] = useState(() => new Date().toISOString().slice(0,16));
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      const g = await apiService.groups.getAll();
      setGroups(g);
    };
    load();
  }, []);

  const submit = async () => {
    setStatus('');
    try {
      await apiService.attendance.selfCheckin({
        group_id: Number(selectedGroup),
        session_datetime: new Date(sessionDatetime).toISOString()
      });
      setStatus(t('checkin.success', 'Успешно се пријавивте'));
    } catch (e) {
      setStatus(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('checkin.title', 'Самопријава')}</h1>
      <div className="bg-white rounded-xl border p-4">
        <label className="block text-sm font-medium mb-1">{t('checkin.group', 'Група')}</label>
        <select className="w-full border rounded-lg px-3 py-2 mb-3" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">{t('checkin.chooseGroup', 'Изберете група')}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} {g.hall ? `— ${g.hall}` : ''}</option>)}
        </select>
        <label className="block text-sm font-medium mb-1">{t('checkin.session', 'Време на час')}</label>
        <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={sessionDatetime} onChange={e => setSessionDatetime(e.target.value)} />
        <button onClick={submit} disabled={!selectedGroup} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {t('checkin.submit', 'Присутен сум')}
        </button>
        {status && <div className="mt-3 text-sm text-green-700">{status}</div>}
      </div>
      <p className="text-xs text-gray-500 mt-3">{t('checkin.note', 'Самопријавата е дозволена кратко пред/по почетокот на часот')}</p>
    </div>
  );
};

export default SelfCheckin;

