import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Filter, ArrowRight, ShoppingBag, FileText, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const STATUS_CONFIG = {
  DRAFT:            { label: 'Draft',              color: 'bg-slate-100 text-slate-600',   icon: '📝' },
  SUBMITTED:        { label: 'Menunggu Verifikasi', color: 'bg-blue-100 text-blue-700',    icon: '📬' },
  PENDING_APPROVAL: { label: 'Menunggu Persetujuan', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  APPROVED:         { label: 'Disetujui',           color: 'bg-green-100 text-green-700',  icon: '✅' },
  REJECTED:         { label: 'Ditolak',             color: 'bg-red-100 text-red-700',      icon: '❌' },
  REVISION:         { label: 'Perlu Revisi',        color: 'bg-orange-100 text-orange-700', icon: '🔄' },
  INVOICE_GENERATED:{ label: 'Invoice Terbit',      color: 'bg-indigo-100 text-indigo-700', icon: '🧾' },
  WAITING_PAYMENT:  { label: 'Menunggu Bayar',      color: 'bg-purple-100 text-purple-700', icon: '💳' },
  ACTIVE_RENTAL:    { label: 'Sewa Aktif',          color: 'bg-teal-100 text-teal-700',    icon: '🏃' },
  COMPLETED:        { label: 'Selesai',             color: 'bg-slate-700 text-white',      icon: '🏁' },
};

// Order lifecycle pipeline steps for progress indicator
const PIPELINE = ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'INVOICE_GENERATED', 'WAITING_PAYMENT', 'ACTIVE_RENTAL', 'COMPLETED'];

const getPipelineProgress = (status) => {
  const idx = PIPELINE.indexOf(status);
  return idx === -1 ? 0 : idx + 1;
};

const OrderCenter = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, statusFilter, search, startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/orders', {
        params: {
          page,
          limit: 15,
          status: statusFilter || undefined,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={26} />
            Order Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Semua transaksi sewa dalam satu tempat — dari pengajuan pertama hingga selesai.
          </p>
        </div>
        {meta && (
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-900">{meta.total}</div>
              <div className="text-xs text-slate-500">Total Order</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari No. Order, Nama Penyewa, Aset..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 flex-shrink-0" />
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input type="date" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:ring-blue-500 outline-none"
            value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
          <input type="date" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:ring-blue-500 outline-none"
            value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Order List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Tidak Ada Order Ditemukan</h3>
          <p className="text-slate-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600', icon: '📋' };
            const progress = getPipelineProgress(order.status);
            const isTerminal = ['REJECTED', 'REVISION'].includes(order.status);

            return (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold font-mono text-blue-600">{order.requestNo}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.color}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                        {order.invoice && (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${order.invoice.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {order.invoice.status === 'PAID' ? '✓ LUNAS' : 'BELUM BAYAR'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-slate-400 text-xs">Penyewa</span>
                          <p className="font-semibold text-slate-800 truncate">{order.tenantUser?.fullName}</p>
                          <p className="text-xs text-slate-500">{order.tenantUser?.organization || order.tenantUser?.email}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs">Aset</span>
                          <p className="font-semibold text-slate-800 truncate">{order.asset?.name}</p>
                          <p className="text-xs text-slate-500">{order.asset?.location}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs">Nilai Invoice</span>
                          <p className="font-bold text-slate-800">
                            {order.invoice
                              ? `Rp ${Number(order.invoice.totalAmount).toLocaleString('id-ID')}`
                              : <span className="text-slate-400 font-normal text-xs">Belum diterbitkan</span>
                            }
                          </p>
                          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>

                      {/* Pipeline Progress Bar */}
                      {!isTerminal && (
                        <div className="mt-4">
                          <div className="flex items-center gap-0">
                            {PIPELINE.map((step, idx) => {
                              const done = idx < progress;
                              const current = idx === progress - 1;
                              const cfg = STATUS_CONFIG[step];
                              return (
                                <div key={step} className="flex items-center flex-1">
                                  <div className={`h-1.5 flex-1 rounded-full transition-all ${done ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${done ? 'bg-blue-500' : current ? 'bg-blue-300 ring-2 ring-blue-200' : 'bg-slate-200'}`} title={cfg?.label} />
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                            <span>Pengajuan</span>
                            <span>Selesai</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Action */}
                    <Link
                      to={`/rentals/${order.id}`}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-semibold text-sm rounded-lg transition-all"
                    >
                      Detail <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Contract bar */}
                {order.contract && (
                  <div className="px-5 py-2.5 bg-green-50 border-t border-green-100 flex items-center justify-between">
                    <span className="text-xs text-green-700 font-medium">📄 Kontrak: {order.contract.contractNo}</span>
                    {order.contract.pdfUrl ? (
                      <a href={order.contract.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline font-semibold">Download PDF</a>
                    ) : (
                      <span className="text-xs text-yellow-600">⏳ PDF sedang diproses...</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">
            Menampilkan {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} order
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              ← Sebelumnya
            </button>
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCenter;
