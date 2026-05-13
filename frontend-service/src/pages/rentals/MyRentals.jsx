import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, CheckCircle2, XCircle, FileEdit, AlertCircle, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION: 'bg-orange-100 text-orange-700',
};

const STATUS_ICONS = {
  DRAFT: <FileEdit size={16} className="mr-1.5" />,
  SUBMITTED: <Clock size={16} className="mr-1.5" />,
  PENDING_APPROVAL: <Clock size={16} className="mr-1.5" />,
  APPROVED: <CheckCircle2 size={16} className="mr-1.5" />,
  REJECTED: <XCircle size={16} className="mr-1.5" />,
  REVISION: <AlertCircle size={16} className="mr-1.5" />,
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Menunggu Verifikasi',
  PENDING_APPROVAL: 'Proses Persetujuan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  REVISION: 'Perlu Revisi',
};

const MyRentals = () => {
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['myRentals'],
    queryFn: async () => {
      const res = await api.get('/rentals');
      return res.data;
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengajuan Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau status permohonan penyewaan aset Anda di sini.</p>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari No. Pengajuan..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {rentals.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <CalendarDays size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Belum ada pengajuan</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Mulai sewa aset pertama Anda melalui Katalog Aset.</p>
              <Link to="/catalog" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Lihat Katalog
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Pengajuan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset & Acara</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold font-mono text-slate-700">{rental.requestNo}</span>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(rental.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{rental.asset?.name}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{rental.eventName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        {new Date(rental.startDatetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} 
                        {' - '} 
                        {new Date(rental.endDatetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[rental.status]}`}>
                        {STATUS_ICONS[rental.status]}
                        {STATUS_LABELS[rental.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/rentals/${rental.id}`} className="text-blue-600 hover:text-blue-900 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
