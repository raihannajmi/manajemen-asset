import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Loader2, Search, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const STATUS_BADGES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION: 'bg-orange-100 text-orange-700',
  ACTIVE_RENTAL: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-slate-800 text-white',
};

const VerifyRentals = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['verifyRentals', statusFilter],
    queryFn: async () => {
      const res = await api.get('/rentals', {
        params: { status: statusFilter || undefined }
      });
      return res.data;
    }
  });

  const filteredRentals = rentals.filter(r => 
    r.requestNo.toLowerCase().includes(search.toLowerCase()) ||
    r.tenantUser?.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.asset?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Semua Pengajuan Aset</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau, verifikasi, dan kelola seluruh riwayat pengajuan sewa.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari No. Pengajuan, Pemohon, atau Aset..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Menunggu Verifikasi (Baru)</option>
            <option value="PENDING_APPROVAL">Menunggu Persetujuan</option>
            <option value="REVISION">Perlu Revisi</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
            <option value="ACTIVE_RENTAL">Sewa Aktif</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {filteredRentals.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <ClipboardCheck size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Data tidak ditemukan</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Coba ubah kata kunci atau filter status Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Pengajuan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemohon</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset & Acara</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold font-mono text-slate-700">{rental.requestNo}</span>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(rental.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{rental.tenantUser?.fullName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{rental.tenantUser?.organization || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{rental.asset?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{rental.eventName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGES[rental.status]}`}>
                          {rental.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/rentals/${rental.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-900 font-semibold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                          Detail <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyRentals;
