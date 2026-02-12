import React, { useEffect, useState, useMemo } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const GroupsManager = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [form, setForm] = useState({ name: '', hall: '', schedule_day: '', schedule_time: '', price: '' });
  const [editForm, setEditForm] = useState({ name: '', hall: '', schedule_day: '', schedule_time: '', price: '' });
  const [memberForm, setMemberForm] = useState({ user_id: '', valid_to: '' });
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const loadGroups = async () => {
    const data = user?.role === 'SuperAdmin' ? await apiService.groups.getAll() : await apiService.groups.getMyTrainerGroups();
    setGroups(data);
  };

  useEffect(() => {
    loadGroups();
    (async () => {
      try {
        const u = await apiService.users.getAll();
        setUsers(Array.isArray(u) ? u : []);
      } catch {
        setUsers([]);
      }
    })();
  }, []);

  useEffect(() => {
    const loadMemberships = async () => {
      if (!selectedGroup) {
        setMemberships([]);
        setEditForm({ name: '', hall: '', schedule_day: '', schedule_time: '', price: '' });
        return;
      }
      const g = groups.find(x => String(x.id) === String(selectedGroup));
      if (g) {
        setEditForm({
          name: g.name || '',
          hall: g.hall || '',
          schedule_day: g.schedule_day == null ? '' : String(g.schedule_day),
          schedule_time: g.schedule_time || '',
          price: g.price == null ? '' : String(g.price)
        });
      }
      const data = await apiService.memberships.getByGroup(selectedGroup);
      setMemberships(data);
    };
    loadMemberships();
  }, [selectedGroup, groups]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 10);
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) || 
      (u.email && u.email.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [users, query]);

  const createGroup = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const payload = {
        name: form.name.trim(),
        trainer_id: user.id,
        hall: form.hall || null,
        schedule_day: form.schedule_day === '' ? null : Number(form.schedule_day),
        schedule_time: form.schedule_time || null,
        price: form.price === '' ? null : Number(form.price)
      };
      await apiService.groups.create(payload);
      setForm({ name: '', hall: '', schedule_day: '', schedule_time: '', price: '' });
      await loadGroups();
      setStatus(t('groups.created', 'Групата е креирана'));
    } catch (e) {
      setStatus(e.message);
    }
  };

  const addMembership = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      if (!selectedGroup) return;
      const payload = {
        user_id: Number(memberForm.user_id),
        group_id: Number(selectedGroup),
        status: 'active',
        valid_to: memberForm.valid_to || null
      };
      await apiService.memberships.upsert(payload);
      setMemberForm({ user_id: '', valid_to: '' });
      const data = await apiService.memberships.getByGroup(selectedGroup);
      setMemberships(data);
      setStatus(t('groups.memberAdded', 'Додаден член во групата'));
    } catch (e) {
      setStatus(e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('groups.title', 'Групи и членарини')}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">{t('groups.create', 'Креирај група')}</h2>
          <form onSubmit={createGroup} className="space-y-3">
            <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.name','Име на група')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.hall','Сала (опц.)')} value={form.hall} onChange={e => setForm({ ...form, hall: e.target.value })} />
            <select className="w-full border rounded-lg px-3 py-2" value={form.schedule_day} onChange={e => setForm({ ...form, schedule_day: e.target.value })}>
              <option value="">{t('groups.day','Ден во недела (опц.)')}</option>
              {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.time','Време HH:MM (опц.)')} value={form.schedule_time} onChange={e => setForm({ ...form, schedule_time: e.target.value })} />
            <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.price','Цена (опц.)') } value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">{t('groups.createBtn','Креирај')}</button>
          </form>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">{t('groups.members','Членови во група')}</h2>
          <select className="w-full border rounded-lg px-3 py-2 mb-3" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            <option value="">{t('groups.choose','Изберете група')}</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} {g.hall ? `— ${g.hall}` : ''} {g.price != null ? `— ${Number(g.price).toLocaleString(undefined,{minimumFractionDigits:2})}` : ''}</option>)}
          </select>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">{t('groups.userId','Корисник')}</label>
            <input className="w-full border rounded-lg px-3 py-2 mb-2" placeholder={t('groups.userId','Име/Е-маил')} value={query} onChange={e => setQuery(e.target.value)} />
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">Нема резултати</div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setMemberForm(prev => ({ ...prev, user_id: String(u.id) }))}
                    className={`w-full text-left px-3 py-2 text-sm border-b hover:bg-gray-50 ${memberForm.user_id === String(u.id) ? 'bg-blue-50' : ''}`}
                  >
                    <div className="font-medium">{u.name || 'Unnamed'}</div>
                    <div className="text-gray-500">{u.email}</div>
                  </button>
                ))
              )}
            </div>
          </div>
          <form onSubmit={addMembership} className="space-y-3 mb-4">
            <input disabled className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.userId','Корисник ID')} value={memberForm.user_id} />
            <input type="date" className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.validTo','Важи до (опц.)')} value={memberForm.valid_to} onChange={e => setMemberForm({ ...memberForm, valid_to: e.target.value })} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">{t('groups.addMember','Додади во група')}</button>
          </form>
          <div className="space-y-2">
            {memberships.length === 0 ? (
              <div className="text-gray-500">{t('groups.noMembers','Нема членови')}</div>
            ) : (
              memberships.map(m => (
                <div key={m.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.user_name}</div>
                    <div className="text-xs text-gray-500">{m.user_email}</div>
                  </div>
                  <div className="text-xs text-gray-500">{m.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">{t('groups.edit','Уреди група')}</h2>
          {!selectedGroup ? (
            <div className="text-gray-500">{t('groups.choose','Изберете група')}</div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus('');
                try {
                  const payload = {
                    name: editForm.name.trim(),
                    hall: editForm.hall || null,
                    schedule_day: editForm.schedule_day === '' ? null : Number(editForm.schedule_day),
                    schedule_time: editForm.schedule_time || null,
                    price: editForm.price === '' ? null : Number(editForm.price)
                  };
                  await apiService.groups.update(Number(selectedGroup), payload);
                  await loadGroups();
                  setStatus(t('groups.updated','Групата е ажурирана'));
                } catch (e2) {
                  setStatus(e2.message);
                }
              }}
              className="space-y-3"
            >
              <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.name','Име на група')} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.hall','Сала (опц.)')} value={editForm.hall} onChange={e => setEditForm({ ...editForm, hall: e.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={editForm.schedule_day} onChange={e => setEditForm({ ...editForm, schedule_day: e.target.value })}>
                <option value="">{t('groups.day','Ден во недела (опц.)')}</option>
                {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.time','Време HH:MM (опц.)')} value={editForm.schedule_time} onChange={e => setEditForm({ ...editForm, schedule_time: e.target.value })} />
              <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder={t('groups.price','Цена (опц.)') } value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">{t('groups.updateBtn','Ажурирај')}</button>
            </form>
          )}
        </div>
      </div>
      {status && <div className="mt-4 text-sm text-green-700">{status}</div>}
    </div>
  );
};

export default GroupsManager;
