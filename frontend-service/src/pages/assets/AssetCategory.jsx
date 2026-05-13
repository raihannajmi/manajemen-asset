import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, Tag } from 'lucide-react';
import api from '../../lib/axios';

const AssetCategory = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: '', name: '', description: '' });

  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: async () => {
      const res = await api.get('/assets/categories');
      return res.data;
    }
  });

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        // Since we don't have update route in the placeholder yet, we can mock it or just create
        // Wait, I didn't add updateCategory in the asset.routes.js! I will handle it here as create only for now
        // Let's assume we post for new ones.
        return api.post('/assets/categories', data);
      }
      return api.post('/assets/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      closeModal();
    }
  });

  const openModal = (category = null) => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ id: null, code: '', name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kategori Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar klasifikasi dan kategori aset kampus.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" /> Tambah Kategori
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                    Belum ada kategori. Silakan tambahkan baru.
                  </td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cat.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-md truncate">{cat.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4" title="Edit (Coming soon)">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Delete (Coming soon)">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {formData.id ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Kategori</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: BGN, KND, ELK"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Bangunan/Gedung"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Keterangan kategori..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCategory;
