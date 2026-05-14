import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Loader2, Search, Filter, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VERIFY: 'bg-yellow-100 text-yellow-700',
  APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700',
};

const AuditLogList = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, moduleFilter, search],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: { page, limit: 30, module: moduleFilter || undefined, search: search || undefined }
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">Seluruh aktivitas sistem yang tercatat secara otomatis.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari action atau entity..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
            value={moduleFilter}
            onChange={e => { setModuleFilter(e.target.value); setPage(1); }}
          >
            <option value="">Semua Modul</option>
            <option value="AUTH">Auth</option>
            <option value="ASSET">Asset</option>
            <option value="RENTAL">Rental</option>
            <option value="BILLING">Billing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <AlertCircle size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Belum ada audit log</h3>
          <p className="text-slate-500 text-sm mt-1">Aktivitas sistem akan tercatat di sini secara otomatis.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modul</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">{log.module}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{log.entityType || '-'}</div>
                      <div className="text-xs font-mono text-slate-400">{log.entityId || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500">{log.actorUserId?.slice(0, 8) || 'system'}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{log.ipAddress || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Menampilkan {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Next
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
