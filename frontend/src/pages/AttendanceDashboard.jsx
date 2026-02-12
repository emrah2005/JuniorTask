import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { apiService } from '../services/api';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceDashboard = () => {
  const { t } = useI18n();
  const [from, setFrom] = useState(() => new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().slice(0,10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));
  const [summary, setSummary] = useState([]);
  const [list, setList] = useState([]);

  const loadData = async () => {
    const params = {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined
    };
    const s = await apiService.attendance.getSummary(params);
    const l = await apiService.attendance.getList(params);
    setSummary(s.map(x => ({ day: x.day, count: Number(x.count) })));
    setList(l);
  };

  useEffect(() => {
    loadData();
  }, [from, to]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('attendance.title', 'Присуство')}</h1>
      <div className="bg-white border rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">{t('attendance.from', 'Од')}</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('attendance.to', 'До')}</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={loadData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">{t('attendance.refresh', 'Освежи')}</button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">{t('attendance.summary', 'Сумирано по ден')}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">{t('attendance.details', 'Детално')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">{t('attendance.dateTime', 'Датум/Време')}</th>
                <th className="p-2">{t('attendance.user', 'Корисник')}</th>
                <th className="p-2">{t('attendance.groupCol', 'Група')}</th>
                <th className="p-2">{t('attendance.source', 'Извор')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{new Date(row.session_datetime).toLocaleString()}</td>
                  <td className="p-2">{row.user_name} <span className="text-gray-500 text-xs">{row.user_email}</span></td>
                  <td className="p-2">{row.group_name}</td>
                  <td className="p-2">{row.source}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td className="p-2 text-gray-500" colSpan="4">{t('attendance.empty', 'Нема податоци')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
