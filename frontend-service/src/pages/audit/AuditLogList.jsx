import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Search, Filter, Loader2, User, Activity, Clock, Shield } from 'lucide-react';
import api from '../../lib/axios';

const MODULE_LABELS = {
  AUTH: 'Autentikasi',
  ASSET: 'Aset',
  RENTAL: 'Penyewaan',
  BILLING: 'Billing/Pembayaran',
};

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VERIFY: 'bg-yellow-100 text-yellow-700',
  APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700',
  SUBMIT: 'bg-indigo-100 text-indigo-700',
};

const AuditLogList = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: logData, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, moduleFilter],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: { 
          page, 
          search: search || undefined, 
          module: moduleFilter || undefined,
          limit: 20
        }
      });
      return res.data;
    }
  });

  const logs = logData?.data || [];
  const meta = logData?.meta || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Audit Sistem</h1>
        <p className="text-slate-500 text-sm mt-1">Jejak aktivitas seluruh pengguna dan perubahan status transaksi secara real-time.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari aktivitas, entitas, atau ID pengguna..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
          >
            <option value="">Semua Modul</option>
            {Object.entries(MODULE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modul</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktivitas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">Tidak ada log aktivitas ditemukan.</td>
                  </tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-700 flex items-center">
                        <Clock size={12} className="mr-1.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                        {MODULE_LABELS[log.module] || log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 flex items-center">
                        <Activity size={14} className="mr-2 text-blue-500" />
                        <span className={`px-2 py-0.5 rounded-full text-[10px] mr-2 ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {log.entityType} ID: <span className="text-slate-400">{log.entityId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs font-semibold text-slate-700">
                        <User size={14} className="mr-2 text-slate-400" />
                        {log.actorUserId || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-400 max-w-[180px] truncate" title={log.userAgent}>
                        <span className="font-mono text-slate-600">{log.ipAddress}</span>
                        <div className="mt-0.5 opacity-60">{log.userAgent}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Menampilkan <span className="font-bold text-slate-900">{((page - 1) * 20) + 1}</span> - <span className="font-bold text-slate-900">{Math.min(page * 20, meta.total)}</span> dari <span className="font-bold text-slate-900">{meta.total}</span> log
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <button 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogList;
