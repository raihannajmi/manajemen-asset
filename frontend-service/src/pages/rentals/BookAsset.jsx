import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Calendar, Users, FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const BookAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = window.location.pathname.includes('/rentals/');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: '',
    startDatetime: '',
    endDatetime: '',
    participantCount: '',
    purpose: '',
  });
  const [docFile, setDocFile] = useState(null);
  const [draftId, setDraftId] = useState(isEditing ? id : null);
  const [error, setError] = useState('');

  // Fetch Existing Rental if Editing
  const { data: rentalData, isLoading: isLoadingRental } = useQuery({
    queryKey: ['rental', id],
    queryFn: async () => {
      const res = await api.get(`/rentals/${id}`);
      return res.data;
    },
    enabled: isEditing
  });

  // Update form data when rental data is loaded
  React.useEffect(() => {
    if (rentalData && isEditing) {
      try {
        setFormData({
          eventName: rentalData.eventName || '',
          startDatetime: rentalData.startDatetime ? new Date(rentalData.startDatetime).toISOString().slice(0, 16) : '',
          endDatetime: rentalData.endDatetime ? new Date(rentalData.endDatetime).toISOString().slice(0, 16) : '',
          participantCount: rentalData.participantCount || '',
          purpose: rentalData.purpose || '',
        });
      } catch (e) {
        console.error("Error parsing dates", e);
      }
    }
  }, [rentalData, isEditing]);

  // Fetch Asset Detail
  const { data: asset, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', isEditing ? 'from-rental' : id],
    queryFn: async () => {
      if (isEditing) {
        const res = await api.get(`/rentals/${id}`);
        return res.data.asset;
      }
      const res = await api.get(`/assets/${id}`);
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        const res = await api.put(`/rentals/${id}`, data);
        return res.data;
      } else {
        const res = await api.post('/rentals', { ...data, assetId: id });
        return res.data;
      }
    },
    onSuccess: (data) => {
      setDraftId(data.id);
      setStep(2);
    },
    onError: (err) => setError(err.response?.data?.message || 'Gagal menyimpan data')
  });

  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      // Mock upload. In real scenario, use FormData
      const res = await api.post(`/rentals/${draftId}/documents`, {
        docType: 'SURAT_PENGANTAR',
        fileUrl: 'https://placeholder.url/surat_pengantar.pdf'
      });
      return res.data;
    },
    onSuccess: () => {
      setStep(3);
    },
    onError: (err) => setError(err.response?.data?.message || 'Gagal upload dokumen')
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/rentals/${draftId}/submit`);
      return res.data;
    },
    onSuccess: () => {
      navigate('/my-rentals');
    },
    onError: (err) => setError(err.response?.data?.message || 'Gagal submit pengajuan')
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(formData);
  };

  const isLoading = isLoadingAsset || (isEditing && isLoadingRental);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {isEditing ? (
        <Link to={`/rentals/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Detail
        </Link>
      ) : (
        <Link to={`/catalog/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Detail
        </Link>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Revisi Pengajuan' : 'Form Pengajuan Sewa'}</h1>
        <p className="text-slate-500 mt-1">Aset: <span className="font-bold text-slate-800">{asset?.name}</span></p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
              ${step === s ? 'border-blue-600 bg-blue-600 text-white' : 
                step > s ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200 text-slate-400'}`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 3 && <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        {step === 1 && (
          <form onSubmit={handleSave} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Calendar className="mr-2 text-blue-600" /> {isEditing ? 'Perbarui Detail Acara' : 'Detail Acara'}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Acara</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} placeholder="Contoh: Seminar Nasional Teknologi" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai</label>
                <input required type="datetime-local" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.startDatetime} onChange={e => setFormData({...formData, startDatetime: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Selesai</label>
                <input required type="datetime-local" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.endDatetime} onChange={e => setFormData({...formData, endDatetime: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimasi Peserta</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input required type="number" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Jumlah orang" value={formData.participantCount} onChange={e => setFormData({...formData, participantCount: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan / Keterangan</label>
              <textarea required rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Deskripsikan tujuan penyewaan..." value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saveMutation.isPending} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center">
                {saveMutation.isPending && <Loader2 className="animate-spin mr-2" size={18} />} Selanjutnya
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <FileText className="mr-2 text-blue-600" /> Upload Dokumen
            </h2>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm mb-6">
              Silakan unggah Surat Pengantar resmi atau Proposal Kegiatan dalam format PDF. (Mock upload)
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload className="mx-auto text-slate-400 mb-4" size={40} />
              <p className="text-slate-600 font-medium">Klik untuk memilih file dokumen</p>
              <p className="text-xs text-slate-400 mt-1">PDF max 5MB</p>
            </div>

            <div className="pt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Kembali</button>
              <button onClick={() => uploadDocMutation.mutate()} disabled={uploadDocMutation.isPending} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center">
                {uploadDocMutation.isPending && <Loader2 className="animate-spin mr-2" size={18} />} Unggah & Lanjut
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Review & Submit</h2>
            <p className="text-slate-600 mb-8">Pastikan semua data sudah benar. Setelah disubmit, pengajuan akan dikirim ke Admin untuk diverifikasi.</p>
            
            <div className="bg-slate-50 p-6 rounded-xl text-left text-sm text-slate-700 mb-8 border border-slate-200">
              <p><span className="font-semibold w-32 inline-block">Acara</span>: {formData.eventName}</p>
              <p><span className="font-semibold w-32 inline-block">Waktu</span>: {formData.startDatetime} - {formData.endDatetime}</p>
              <p><span className="font-semibold w-32 inline-block">Dokumen</span>: 1 File terlampir (Surat Pengantar)</p>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Kembali</button>
              <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center">
                {submitMutation.isPending && <Loader2 className="animate-spin mr-2" size={18} />} Kirim Pengajuan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CheckCircle2 icon missing import fallback
function CheckCircle2(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

export default BookAsset;
