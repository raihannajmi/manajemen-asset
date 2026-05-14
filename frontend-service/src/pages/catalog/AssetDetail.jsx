import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Calendar, ArrowLeft, Loader2, CheckCircle2, Clock, DollarSign, FileText, Package } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/axios';

const UNIT_LABELS = {
  hour: 'Jam', day: 'Hari', week: 'Minggu', month: 'Bulan', year: 'Tahun'
};

const STATUS_BADGES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION: 'bg-orange-100 text-orange-700',
  ACTIVE_RENTAL: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-slate-700 text-white',
  INVOICE_GENERATED: 'bg-indigo-100 text-indigo-700',
  WAITING_PAYMENT: 'bg-purple-100 text-purple-700',
};

const AssetDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const res = await api.get(`/assets/${id}`);
      return res.data;
    }
  });

  const { data: rentalHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['asset-history', id],
    queryFn: async () => {
      const res = await api.get(`/assets/${id}/history`);
      return res.data;
    },
    enabled: ['ADMIN_ASET', 'PIMPINAN'].includes(user?.role)
  });

  const isAdminOrPimpinan = ['ADMIN_ASET', 'PIMPINAN'].includes(user?.role);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  if (!asset) {
    return <div className="text-center py-32 text-slate-500">Aset tidak ditemukan.</div>;
  }

  const pricing = asset.pricingSchemeJson;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to={isAdminOrPimpinan ? '/assets' : '/catalog'} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Kembali
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="aspect-[16/9] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 relative">
            {asset.media?.[0] ? (
              <img src={asset.media[0].fileUrl} alt={asset.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-2 text-slate-300" />
                <span className="text-sm">Belum ada foto</span>
                {isAdminOrPimpinan && <span className="text-xs mt-1 text-blue-500">Upload foto dari halaman Manajemen Aset</span>}
              </div>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-3">
              {asset.category?.name}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{asset.name}</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                <MapPin size={18} className="mr-2 text-slate-400" />
                {asset.location || 'Lokasi tidak disebutkan'}
              </div>
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                <Package size={18} className="mr-2 text-slate-400" />
                Tersedia: <strong className="ml-1 text-slate-900">{asset.availableQuantity}</strong><span className="mx-1 text-slate-400">/</span>{asset.capacity}
              </div>
            </div>
          </div>

          {/* Tabs - Conditionally show History for Admin/Pimpinan */}
          {isAdminOrPimpinan && (
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Informasi Aset
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ml-4 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Riwayat Penyewaan
                {rentalHistory.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{rentalHistory.length}</span>
                )}
              </button>
            </div>
          )}

          {/* Tab: Info */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Deskripsi</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {asset.description || 'Tidak ada deskripsi untuk aset ini.'}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Fasilitas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {asset.facilitiesJson?.map((fac, idx) => (
                    <div key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 size={18} className="mr-2 text-green-500" />
                      {fac}
                    </div>
                  ))}
                  {(!asset.facilitiesJson || asset.facilitiesJson.length === 0) && (
                    <div className="text-slate-500">Tidak ada data fasilitas.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: History (Admin/Pimpinan only) */}
          {activeTab === 'history' && isAdminOrPimpinan && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Riwayat Penyewaan Aset</h2>
              {isHistoryLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
              ) : rentalHistory.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">Belum ada riwayat penyewaan untuk aset ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rentalHistory.map(rental => (
                    <Link to={`/rentals/${rental.id}`} key={rental.id}
                      className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <FileText size={20} className="text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-bold text-slate-900">{rental.tenantUser?.fullName}</span>
                            <span className="mx-2 text-slate-300 text-xs">|</span>
                            <span className="text-xs text-slate-500 font-mono">{rental.requestNo}</span>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGES[rental.status] || 'bg-slate-100 text-slate-600'}`}>
                            {rental.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            <span className="font-medium">
                              {new Date(rental.startDatetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} – {new Date(rental.endDatetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            <span>Durasi: {Math.ceil((new Date(rental.endDatetime) - new Date(rental.startDatetime)) / (1000 * 60 * 60 * 24))} Hari</span>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs font-bold text-slate-700">{rental.eventName}</p>
                          <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                            "{rental.purpose || 'Tanpa keterangan tujuan'}"
                          </p>
                        </div>

                        {rental.invoice?.totalAmount && (
                          <div className="mt-3 flex items-center justify-end">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                              Revenue: Rp {rental.invoice.totalAmount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar / Booking Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Skema Harga</h3>
            <div className="space-y-3 mb-6">
              {pricing?.base_price != null ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500">Harga Dasar / {UNIT_LABELS[pricing.unit] || pricing.unit}</span>
                    <span className="font-bold text-slate-900">Rp {Number(pricing.base_price).toLocaleString('id-ID')}</span>
                  </div>
                  {pricing.deposit > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Deposit (Jaminan)</span>
                      <span className="font-bold text-orange-600">Rp {Number(pricing.deposit).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {pricing.tax_percent > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Pajak (PPN)</span>
                      <span className="font-bold text-slate-900">{pricing.tax_percent}%</span>
                    </div>
                  )}
                  {pricing.tiers?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga Bertingkat</p>
                      {pricing.tiers.map((tier, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50">
                          <span className="text-slate-500">{tier.min_units}{tier.max_units ? `-${tier.max_units}` : '+'} {UNIT_LABELS[pricing.unit]}</span>
                          <span className="font-semibold text-slate-800">Rp {Number(tier.price_per_unit).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-500">Hubungi admin untuk harga.</div>
              )}
            </div>

            {!isAdminOrPimpinan && (
              <Link
                to={`/catalog/${id}/book`}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
              >
                <Calendar size={20} className="mr-2" /> Ajukan Penyewaan
              </Link>
            )}
            <p className="text-xs text-center text-slate-400 mt-4">
              {isAdminOrPimpinan
                ? 'Lihat tab Riwayat Penyewaan untuk histori.'
                : 'Anda bisa memilih tanggal dan melihat ketersediaan pada langkah selanjutnya.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
