import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { apiService } from '../services/api';

const CoachTablet = () => {
  const { t } = useI18n();
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sessionDatetime, setSessionDatetime] = useState(() => new Date().toISOString().slice(0,16));
  const [selectedIds, setSelectedIds] = useState({});
  const [status, setStatus] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [historyDate, setHistoryDate] = useState(() => new Date().toISOString().slice(0,10));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      const g = await apiService.groups.getMyTrainerGroups();
      setGroups(g);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedGroup) {
        setMembers([]);
        return;
      }
      const ms = await apiService.memberships.getByGroup(selectedGroup);
      setMembers(ms);
      setSelectedIds({});
    };
    loadMembers();
  }, [selectedGroup]);

  const toggle = (id) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (members.length === 0) return;
    const all = {};
    members.forEach(m => { all[m.user_id] = true; });
    setSelectedIds(all);
    setSelectAll(true);
  };

  const setSessionNow = () => {
    setSessionDatetime(new Date().toISOString().slice(0,16));
  };

  const submit = async () => {
    setStatus('');
    try {
      const payload = {
        group_id: Number(selectedGroup),
        session_datetime: new Date(sessionDatetime).toISOString(),
        user_ids: Object.keys(selectedIds).filter(id => selectedIds[id]).map(Number)
      };
      const res = await apiService.attendance.coachCheckin(payload);
      setStatus(t('tablet.success', 'Снимено присуство'));
    } catch (e) {
      setStatus(e.message);
    }
  };

  const loadHistory = async () => {
    if (!historyDate) {
      setHistory([]);
      return;
    }
    const d = new Date(historyDate);
    const from = new Date(d); from.setHours(0,0,0,0);
    const to = new Date(d); to.setHours(23,59,59,999);
    const params = {
      from: from.toISOString(),
      to: to.toISOString()
    };
    if (selectedGroup) {
      params.group_id = Number(selectedGroup);
    }
    const list = await apiService.attendance.getList(params);
    setHistory(list);
  };

  useEffect(() => {
    loadHistory();
  }, [selectedGroup, historyDate]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('tablet.title', 'Таблет во сала')}</h1>
      <div className="bg-white rounded-xl border p-4 mb-4">
        <label className="block text-sm font-medium mb-1">{t('tablet.group', 'Група')}</label>
        <select className="w-full border rounded-lg px-3 py-2 mb-3" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">{t('tablet.chooseGroup', 'Изберете група')}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} {g.hall ? `— ${g.hall}` : ''}</option>)}
        </select>
        <label className="block text-sm font-medium mb-1">{t('tablet.session', 'Време на час')}</label>
        <div className="flex gap-2">
          <input type="datetime-local" className="flex-1 border rounded-lg px-3 py-2" value={sessionDatetime} onChange={e => setSessionDatetime(e.target.value)} />
          <button type="button" onClick={setSessionNow} className="px-3 py-2 border rounded-lg">
            {t('calendar.today', 'Денес')}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-4">
        {members.length === 0 ? (
          <div className="text-gray-500">{t('tablet.noMembers', 'Нема активни членови')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={toggleAll}
              className="col-span-1 sm:col-span-2 mb-2 px-3 py-2 border rounded-lg"
            >
              {t('tablet.selectAll', 'Селектирај сите')}
            </button>
            {members.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.user_id)}
                className={`text-left p-3 rounded-xl border ${selectedIds[m.user_id] ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="font-bold">{m.user_name}</div>
                <div className="text-sm text-gray-500">{m.user_email}</div>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('tablet.save', 'Сними присуство')}
          </button>
        </div>
        {status && <div className="mt-3 text-sm text-green-700">{status}</div>}
      </div>
      <div className="bg-white rounded-xl border p-4 mt-4">
        <h2 className="text-lg font-semibold mb-3">{t('tablet.historyTitle', 'Присуство по датум')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">{t('tablet.historyDate', 'Датум')}</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={historyDate} onChange={e => setHistoryDate(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="button" onClick={loadHistory} className="px-4 py-2 border rounded-lg">
              {t('tablet.historyShow', 'Покажи')}
            </button>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="text-gray-500">{t('tablet.historyEmpty', 'Нема присутни за избраниот датум')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">{t('attendance.dateTime','Датум/Време')}</th>
                  <th className="p-2">{t('attendance.user','Корисник')}</th>
                  <th className="p-2">{t('attendance.groupCol','Група')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map(row => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2">{new Date(row.session_datetime).toLocaleString()}</td>
                    <td className="p-2">{row.user_name} <span className="text-xs text-gray-500">{row.user_email}</span></td>
                    <td className="p-2">{row.group_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachTablet;
