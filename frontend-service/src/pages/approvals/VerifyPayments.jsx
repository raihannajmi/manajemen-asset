import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2, Search, Check, X } from 'lucide-react';
import api from '../../lib/axios';

const VerifyPayments = () => {
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [note, setNote] = useState('');

  // We should actually fetch payments, but for this mock we'll just get invoices with PENDING payments
  // Or create a dedicated endpoint. Since we don't have a GET /payments, we'll assume we can fetch invoices 
  // that have PENDING payments. To make it simple, let's fetch rentals that are INVOICE_GENERATED.
  // Ideally, there should be a `GET /payments?status=PENDING`. Let's mock the data fetching for now 
  // or use rentals endpoint.
  
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: async () => {
      const res = await api.get('/rentals?status=INVOICE_GENERATED');
      // Filter out those without pending payments (mocking logic on FE for now)
      return res.data;
    }
  });

  // Mock verify action since we don't have a direct payment list endpoint
  const verifyMutation = useMutation({
    mutationFn: async ({ paymentId, status }) => {
      return api.post(`/payments/${paymentId}/verify`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayments']);
      setSelectedPayment(null);
      setNote('');
      alert('Pembayaran berhasil diproses');
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verifikasi Pembayaran</h1>
        <p className="text-slate-500 text-sm mt-1">Periksa bukti transfer dari penyewa untuk mengaktifkan sewa.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {rentals.length === 0 ? (
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
                {rentals.map((rental) => {
                  // In a real app, we'd loop through payments.
                  // This is a UI mockup structure since we didn't build the specific GET /payments endpoint.
                  // Assuming the latest payment is accessible if we expand the API.
                  return (
                    <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold font-mono text-slate-700">{rental.requestNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{rental.tenantUser?.fullName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">Rp {(1000000).toLocaleString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline cursor-pointer">
                        Lihat Bukti
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                        <button className="text-red-600 hover:text-red-900">Reject</button>
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
