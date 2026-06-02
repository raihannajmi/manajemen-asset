import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, Check, X, FileText } from 'lucide-react';
import api from '../../lib/axios';

const VerifyPayments = () => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: async () => {
      const res = await api.get('/rentals', {
        params: { status: 'WAITING_PAYMENT' }
      });
      return res.data;
    }
  });

  const rows = rentals
    .map((rental) => {
      const pendingPayment = rental.invoice?.payments?.[0];
      return pendingPayment ? { rental, payment: pendingPayment } : null;
    })
    .filter(Boolean);

  const verifyMutation = useMutation({
    mutationFn: async ({ paymentId, status }) => {
      return api.post(`/payments/${paymentId}/verify`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayments']);
      setNote('');
      alert('Pembayaran berhasil diproses');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran');
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verifikasi Pembayaran</h1>
        <p className="text-slate-500 text-sm mt-1">Periksa bukti transfer dari penyewa untuk mengaktifkan sewa.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Verifikasi</label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Isi alasan jika menolak pembayaran, atau catatan singkat verifikasi..."
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {rows.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <CreditCard size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Tidak ada antrean pembayaran</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Semua bukti transfer telah diverifikasi.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Pengajuan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemohon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagihan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bukti Transfer</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rows.map(({ rental, payment }) => {
                  return (
                    <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold font-mono text-slate-700">{rental.requestNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{rental.tenantUser?.fullName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">Rp {rental.invoice?.totalAmount?.toLocaleString('id-ID') || '-'}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{rental.invoice?.invoiceNo || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                          <FileText size={14} /> Lihat Bukti
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            verifyMutation.mutate({ paymentId: payment.id, status: 'VERIFIED' });
                          }}
                          disabled={verifyMutation.isPending}
                          className="text-green-600 hover:text-green-900 mr-4 inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={() => {
                            verifyMutation.mutate({ paymentId: payment.id, status: 'REJECTED' });
                          }}
                          disabled={verifyMutation.isPending}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          <X size={16} /> Reject
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPayments;
