import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Calendar, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';

const AssetDetail = () => {
  const { id } = useParams();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const res = await api.get(`/assets/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  if (!asset) {
    return <div className="text-center py-32 text-slate-500">Aset tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/catalog" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[16/9] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
            {asset.media?.[0] ? (
              <img src={asset.media[0].fileUrl} alt={asset.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">No Image Available</div>
            )}
          </div>

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
                <Users size={18} className="mr-2 text-slate-400" />
                Kapasitas {asset.capacity || '-'} orang
              </div>
            </div>
          </div>

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

        {/* Sidebar / Booking Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Skema Harga</h3>
            <div className="space-y-3 mb-6">
              {asset.pricingSchemeJson?.hourly && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Per Jam</span>
                  <span className="font-bold text-slate-900">Rp {asset.pricingSchemeJson.hourly}</span>
                </div>
              )}
              {asset.pricingSchemeJson?.daily && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Per Hari</span>
                  <span className="font-bold text-slate-900">Rp {asset.pricingSchemeJson.daily}</span>
                </div>
              )}
              {asset.pricingSchemeJson?.monthly && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Per Bulan</span>
                  <span className="font-bold text-slate-900">Rp {asset.pricingSchemeJson.monthly}</span>
                </div>
              )}
              {(!asset.pricingSchemeJson || Object.keys(asset.pricingSchemeJson).length === 0) && (
                <div className="text-sm text-slate-500">Hubungi admin untuk harga.</div>
              )}
            </div>

            <button className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
              <Calendar size={20} className="mr-2" /> Ajukan Penyewaan
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              Anda bisa memilih tanggal dan melihat ketersediaan pada langkah selanjutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
