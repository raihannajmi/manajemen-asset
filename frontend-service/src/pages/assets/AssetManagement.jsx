import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, Package, MapPin, Tag, X, DollarSign, Percent, Info, Layers } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/axios';

const pricingTierSchema = z.object({
  min_units: z.coerce.number().min(1, 'Minimal 1'),
  max_units: z.coerce.number().nullable().optional(),
  price_per_unit: z.coerce.number().min(0, 'Minimal 0')
});

const assetSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  assetCode: z.string().min(3, 'Kode minimal 3 karakter').max(20),
  categoryId: z.coerce.number().min(1, 'Pilih kategori'),
  description: z.string().optional().nullable(),
  location: z.string().min(3, 'Lokasi minimal 3 karakter'),
  capacity: z.coerce.number().min(1, 'Quantity minimal 1'),
  availabilityStatus: z.enum(['AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE']),
  pricingSchemeJson: z.object({
    unit: z.enum(['hour', 'day', 'week', 'month']),
    base_price: z.coerce.number().min(0),
    deposit: z.coerce.number().min(0),
    tax_percent: z.coerce.number().min(0).max(100),
    tiers: z.array(pricingTierSchema).optional()
  })
});

const AssetManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [uploadingImageFor, setUploadingImageFor] = useState(null); // assetId for image upload

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      assetCode: '',
      categoryId: '',
      description: '',
      location: '',
      capacity: 0,
      availabilityStatus: 'AVAILABLE',
      pricingSchemeJson: {
        unit: 'day',
        base_price: 0,
        deposit: 0,
        tax_percent: 11,
        tiers: []
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricingSchemeJson.tiers"
  });

  // Fetch Assets
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await api.get('/assets');
      return res.data;
    }
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/assets/categories');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      handleCloseModal();
    },
    onError: (err) => alert(err.response?.data?.message || 'Gagal menyimpan aset')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/assets/${editingAsset.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      handleCloseModal();
    },
    onError: (err) => alert(err.response?.data?.message || 'Gagal memperbarui aset')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['assets']),
    onError: (err) => alert(err.response?.data?.message || 'Gagal menghapus aset')
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ assetId, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', 'IMAGE');
      return api.post(`/assets/${assetId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      setUploadingImageFor(null);
      alert('Foto berhasil diunggah ke Cloudflare R2!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Gagal upload foto')
  });

  const deleteMediaMutation = useMutation({
    mutationFn: ({ assetId, mediaId }) => api.delete(`/assets/${assetId}/media/${mediaId}`),
    onSuccess: () => queryClient.invalidateQueries(['assets']),
    onError: (err) => alert(err.response?.data?.message || 'Gagal menghapus foto')
  });

  const onSubmit = (data) => {
    if (editingAsset) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    reset({
      name: asset.name,
      assetCode: asset.assetCode,
      categoryId: asset.categoryId,
      description: asset.description,
      location: asset.location,
      capacity: asset.capacity,
      availabilityStatus: asset.availabilityStatus,
      pricingSchemeJson: asset.pricingSchemeJson || {
        unit: 'day',
        base_price: 0,
        deposit: 0,
        tax_percent: 11,
        tiers: []
      }
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    reset({
      name: '',
      assetCode: '',
      categoryId: '',
      description: '',
      location: '',
      capacity: 0,
      availabilityStatus: 'AVAILABLE',
      pricingSchemeJson: {
        unit: 'day',
        base_price: 0,
        deposit: 0,
        tax_percent: 11,
        tiers: []
      }
    });
  };

  const pricingUnit = watch('pricingSchemeJson.unit');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola master data aset, harga dinamis, dan fasilitas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" /> Tambah Aset
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    Belum ada data aset. Silakan tambahkan baru.
                  </td>
                </tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  {/* Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="h-12 w-16 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group cursor-pointer"
                      onClick={() => setUploadingImageFor(uploadingImageFor === asset.id ? null : asset.id)}
                    >
                      {asset.media?.[0] ? (
                        <img src={asset.media[0].fileUrl} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-[10px] text-slate-400 text-center leading-tight">Klik upload</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-blue-600/70 hidden group-hover:flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">📷 Ganti</span>
                      </div>
                    </div>
                    {/* Inline image upload input */}
                    {uploadingImageFor === asset.id && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <label className="block text-[11px] font-bold text-blue-700 mb-1">Upload Foto (R2)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="text-xs w-full"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadImageMutation.mutate({ assetId: asset.id, file: e.target.files[0] });
                            }
                          }}
                        />
                        {uploadImageMutation.isPending && <p className="text-[10px] text-blue-600 mt-1 animate-pulse">Mengupload...</p>}
                        {asset.media?.length > 0 && (
                          <button
                            onClick={() => deleteMediaMutation.mutate({ assetId: asset.id, mediaId: asset.media[0].id })}
                            className="text-[10px] text-red-500 hover:text-red-700 mt-1 block"
                          >
                            🗑 Hapus foto saat ini
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Asset Info */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{asset.assetCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-700">
                      <Tag size={14} className="mr-1.5 text-slate-400" />
                      {asset.category?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${asset.availabilityStatus === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                        asset.availabilityStatus === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {asset.availabilityStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(asset)}
                      className="text-blue-600 hover:text-blue-900 mr-4" 
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => confirm('Hapus aset ini?') && deleteMutation.mutate(asset.id)}
                      className="text-red-600 hover:text-red-900" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">{editingAsset ? 'Edit Aset' : 'Tambah Aset Baru'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center border-b pb-2">
                  <Info size={20} className="mr-2 text-blue-600" /> Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
                    <input
                      {...register('name')}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="Gedung Serbaguna"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Aset (Unik)</label>
                    <input
                      {...register('assetCode')}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono ${errors.assetCode ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="GSG-001"
                    />
                    {errors.assetCode && <p className="mt-1 text-xs text-red-500">{errors.assetCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select
                      {...register('categoryId')}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.categoryId ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input
                        {...register('location')}
                        className={`w-full pl-10 px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.location ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="Kampus Pusat"
                      />
                    </div>
                    {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Stok)</label>
                    <input
                      type="number"
                      {...register('capacity')}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.capacity ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="500"
                    />
                    {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status Ketersediaan</label>
                    <select
                      {...register('availabilityStatus')}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="AVAILABLE">Tersedia</option>
                      <option value="MAINTENANCE">Dalam Perbaikan</option>
                      <option value="UNAVAILABLE">Tidak Tersedia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Fasilitas</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Contoh: Dilengkapi AC, Projector, Sound System..."
                  />
                </div>
              </div>

              {/* Pricing Section Builder */}
              <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center border-b border-slate-200 pb-2">
                  <DollarSign size={20} className="mr-2 text-indigo-600" /> Skema Harga & Tiering
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Satuan Sewa</label>
                    <select
                      {...register('pricingSchemeJson.unit')}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="hour">Per Jam</option>
                      <option value="day">Per Hari</option>
                      <option value="week">Per Minggu</option>
                      <option value="month">Per Bulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga Dasar (Base)</label>
                    <input
                      type="number"
                      {...register('pricingSchemeJson.base_price')}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jaminan (Deposit)</label>
                    <input
                      type="number"
                      {...register('pricingSchemeJson.deposit')}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pajak / PPN (%)</label>
                    <div className="relative">
                      <Percent className="absolute right-3 top-2.5 text-slate-400" size={16} />
                      <input
                        type="number"
                        {...register('pricingSchemeJson.tax_percent')}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                        placeholder="11"
                      />
                    </div>
                  </div>
                </div>

                {/* Tiering Builder */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <Layers size={16} className="mr-2" /> Harga Bertingkat (Tiers)
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ min_units: 1, max_units: null, price_per_unit: 0 })}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center bg-white px-3 py-1.5 rounded-lg border border-blue-200"
                    >
                      <Plus size={14} className="mr-1" /> Tambah Tier
                    </button>
                  </div>
                  
                  {fields.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs text-slate-400 italic">Klik "Tambah Tier" untuk mengatur harga berdasarkan durasi sewa.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <div className="col-span-3">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Min {pricingUnit}</label>
                            <input
                              type="number"
                              {...register(`pricingSchemeJson.tiers.${index}.min_units`)}
                              className="w-full px-3 py-1.5 border border-slate-100 rounded-lg text-sm outline-none bg-slate-50"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Max {pricingUnit} (Opsional)</label>
                            <input
                              type="number"
                              {...register(`pricingSchemeJson.tiers.${index}.max_units`)}
                              className="w-full px-3 py-1.5 border border-slate-100 rounded-lg text-sm outline-none bg-slate-50"
                              placeholder="∞"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Harga Per {pricingUnit}</label>
                            <input
                              type="number"
                              {...register(`pricingSchemeJson.tiers.${index}.price_per_unit`)}
                              className="w-full px-3 py-1.5 border border-slate-100 rounded-lg text-sm outline-none bg-slate-50 font-bold text-blue-600"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-lg shadow-blue-200"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin mr-2" size={18} />}
                  {editingAsset ? 'Perbarui Aset' : 'Simpan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
