import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackagePlus, UploadCloud, Loader2, FileSpreadsheet } from 'lucide-react';
import api from '../../lib/axios';

const AdditionalAssets = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonData, setJsonData] = useState('');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['additionalAssets'],
    queryFn: async () => {
      const res = await api.get('/assets/additional');
      return res.data;
    }
  });

  const importMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/assets/additional/import', { data: JSON.parse(data) });
      return res.data;
    },
    onSuccess: (res) => {
      alert(res.message);
      setIsModalOpen(false);
      setJsonData('');
      queryClient.invalidateQueries(['additionalAssets']);
    },
    onError: (err) => {
      alert('Error import: ' + err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Aset Tambahan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola fasilitas tambahan (seperti panggung, sound system) via Excel.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
        >
          <FileSpreadsheet size={18} className="mr-2" />
          Import Excel
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Barang</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga/Satuan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{asset.assetCode}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Rp {asset.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.stock}</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    Data aset tambahan masih kosong. Silakan import melalui Excel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Import Data Excel</h2>
            <p className="text-sm text-slate-500 mb-4">Paste data JSON array (sebagai mockup pengganti file Excel parser).</p>
            
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={`[\n  { "assetCode": "A001", "name": "Sound System JBL", "category": "SOUND_SYSTEM", "price": 500000, "stock": 2 }\n]`}
              className="w-full h-40 p-3 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Batal</button>
              <button 
                onClick={() => importMutation.mutate(jsonData)}
                disabled={!jsonData || importMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {importMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                Proses Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalAssets;
