import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const AssetCatalog = () => {
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assetsPublic'],
    queryFn: async () => {
      const res = await api.get('/assets');
      return res.data.filter(a => a.availabilityStatus === 'AVAILABLE');
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Katalog Aset</h1>
        <p className="text-slate-500 mt-2">Temukan dan sewa ruangan, gedung, atau fasilitas kampus yang Anda butuhkan.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama aset, gedung, dll..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          Cari Aset
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assets.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
              Belum ada aset yang tersedia saat ini.
            </div>
          ) : assets.map(asset => (
            <Link key={asset.id} to={`/catalog/${asset.id}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {asset.media?.[0] ? (
                  <img src={asset.media[0].fileUrl} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-sm">
                  {asset.category?.name}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asset.name}</h3>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin size={16} className="mr-2 text-slate-400" />
                    {asset.location || 'Lokasi tidak disebutkan'}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Users size={16} className="mr-2 text-slate-400" />
                    Kapasitas: {asset.capacity ? `${asset.capacity} orang` : '-'}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">Mulai dari</p>
                    <p className="text-lg font-bold text-blue-600">Rp {asset.pricingSchemeJson?.daily || asset.pricingSchemeJson?.hourly || '0'}</p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    Lihat Detail
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetCatalog;
