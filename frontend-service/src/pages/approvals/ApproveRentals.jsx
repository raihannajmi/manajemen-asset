import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PenTool, Loader2, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const ApproveRentals = () => {
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['approveRentals'],
    queryFn: async () => {
      // Fetch only PENDING_APPROVAL rentals for Pimpinan
      const res = await api.get('/rentals?status=PENDING_APPROVAL');
      return res.data;
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Persetujuan Pimpinan</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar pengajuan yang menunggu keputusan Anda.</p>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari No. Pengajuan atau Nama Pemohon..." 
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
                <PenTool size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Tidak ada antrean persetujuan</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Semua pengajuan telah Anda putuskan.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Pengajuan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemohon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset & Acara</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Sejak</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold font-mono text-slate-700">{rental.requestNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{rental.tenantUser?.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rental.tenantUser?.organization || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{rental.asset?.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{rental.eventName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(rental.updatedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/rentals/${rental.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-900 font-semibold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        Beri Keputusan <ArrowRight size={16} className="ml-2" />
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

export default ApproveRentals;
