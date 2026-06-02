import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Calendar, FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/axios';

const bookAssetSchema = z.object({
  eventName: z.string().min(3, 'Nama acara minimal 3 karakter').max(100, 'Nama acara maksimal 100 karakter'),
  startDatetime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endDatetime: z.string().min(1, 'Waktu selesai wajib diisi'),
  participantCount: z.coerce.number().min(1, 'Peserta minimal 1 orang'),
  purpose: z.string().min(10, 'Tujuan/Keterangan minimal 10 karakter'),
}).refine(data => {
  if (data.startDatetime && data.endDatetime) {
    return new Date(data.endDatetime) > new Date(data.startDatetime);
  }
  return true;
}, {
  message: 'Waktu selesai harus lebih besar dari waktu mulai',
  path: ['endDatetime']
});

const PriceEstimate = ({ assetId, start, end }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['price-estimate', assetId, start, end],
    queryFn: async () => {
      const res = await api.get(`/assets/${assetId}/price-estimate?start=${start}&end=${end}`);
      return res.data;
    },
    retry: false
  });

  if (isLoading) return <div className="text-sm text-slate-500 animate-pulse mt-4">Menghitung estimasi biaya...</div>;
  if (error || !data || data.message) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-6">
      <h3 className="text-sm font-bold text-indigo-900 mb-2">Estimasi Biaya Sewa</h3>
      <div className="space-y-1 text-sm text-indigo-800">
        <div className="flex justify-between">
          <span>Durasi Sewa:</span>
          <span className="font-semibold">{data.units} {data.unitType}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rp {data.subtotal?.toLocaleString('id-ID')}</span>
        </div>
        {data.tax > 0 && (
          <div className="flex justify-between text-indigo-600">
            <span>Pajak (PPN):</span>
            <span>Rp {data.tax?.toLocaleString('id-ID')}</span>
          </div>
        )}
        {data.deposit > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Deposit (Refundable):</span>
            <span>Rp {data.deposit?.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 mt-2 border-t border-indigo-200 font-bold text-base">
          <span>Estimasi Total:</span>
          <span>Rp {data.total?.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};

const BookAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = window.location.pathname.includes('/rentals/');
  const [step, setStep] = useState(1);
  const [docFile, setDocFile] = useState(null);
  const [draftId, setDraftId] = useState(isEditing ? id : null);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: zodResolver(bookAssetSchema),
    defaultValues: {
      eventName: '',
      startDatetime: '',
      endDatetime: '',
      participantCount: '',
      purpose: '',
    }
  });

  const getBookingContext = (asset) => {
    const categoryCode = asset?.category?.code?.toUpperCase();
    const categoryName = asset?.category?.name?.toLowerCase() || '';

    if (categoryCode === 'ASRAMA' || categoryName.includes('asrama')) {
      return {
        title: 'Form Pengajuan Asrama',
        subtitle: 'Isi data penginapan, durasi, dan jumlah penghuni yang akan menginap.',
        eventLabel: 'Nama Penghuni / Kegiatan',
        eventPlaceholder: 'Contoh: Penempatan Mahasiswa Magang',
        participantLabel: 'Jumlah Penghuni',
        participantPlaceholder: 'Contoh: 2',
        purposeLabel: 'Tujuan Penginapan',
        purposePlaceholder: 'Jelaskan kebutuhan menginap, tanggal masuk, dan kebutuhan khusus lainnya.',
      };
    }

    if (categoryCode === 'KANTIN' || categoryName.includes('kantin')) {
      return {
        title: 'Form Pengajuan Kantin',
        subtitle: 'Gunakan form ini untuk tenant atau pelaku usaha yang ingin berjualan dalam periode tertentu.',
        eventLabel: 'Nama Tenant / Usaha',
        eventPlaceholder: 'Contoh: Kopi Pagi Sejahtera',
        participantLabel: 'Jumlah Personel',
        participantPlaceholder: 'Contoh: 3',
        purposeLabel: 'Rencana Usaha / Keterangan',
        purposePlaceholder: 'Jelaskan jenis usaha, produk yang dijual, dan kebutuhan operasional.',
      };
    }

    if (categoryCode === 'GEDUNG' || categoryCode === 'GEDUNG_KEWIRAUSAHAAN' || categoryName.includes('gedung')) {
      return {
        title: 'Form Pengajuan Gedung',
        subtitle: 'Form ini dipakai untuk kegiatan, acara, pelatihan, atau program yang membutuhkan ruang gedung.',
        eventLabel: 'Nama Kegiatan / Program',
        eventPlaceholder: 'Contoh: Seminar Nasional Inovasi Kampus',
        participantLabel: 'Jumlah Peserta',
        participantPlaceholder: 'Contoh: 120',
        purposeLabel: 'Tujuan Kegiatan',
        purposePlaceholder: 'Jelaskan tujuan acara, format kegiatan, dan kebutuhan ruang yang diperlukan.',
      };
    }

    return {
      title: 'Form Pengajuan Sewa',
      subtitle: 'Lengkapi detail penggunaan aset, durasi sewa, dan tujuan pemakaian.',
      eventLabel: 'Nama Acara / Penggunaan',
      eventPlaceholder: 'Contoh: Seminar Nasional Teknologi',
      participantLabel: 'Jumlah Peserta / Pengguna',
      participantPlaceholder: 'Contoh: 50',
      purposeLabel: 'Tujuan / Keterangan',
      purposePlaceholder: 'Deskripsikan tujuan penyewaan dan kebutuhan penggunaan aset.',
    };
  };

  const eventName = useWatch({ control, name: 'eventName' });
  const startDatetime = useWatch({ control, name: 'startDatetime' });
  const endDatetime = useWatch({ control, name: 'endDatetime' });
  const participantCount = useWatch({ control, name: 'participantCount' });
  const purpose = useWatch({ control, name: 'purpose' });

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
  useEffect(() => {
    if (rentalData && isEditing) {
      try {
        reset({
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
  }, [rentalData, isEditing, reset]);

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

  const bookingContext = getBookingContext(asset);

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
      if (!docFile) throw new Error('Pilih file dokumen terlebih dahulu');
      
      const formData = new FormData();
      formData.append('docType', 'SURAT_PENGANTAR');
      formData.append('file', docFile);

      const res = await api.post(`/rentals/${draftId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Revisi Pengajuan' : bookingContext.title}</h1>
        <p className="text-slate-500 mt-1">{bookingContext.subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-[240px,1fr]">
        <div className="aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
          {asset?.media?.[0] ? (
            <img src={asset.media[0].fileUrl} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full min-h-48 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
              Belum ada foto aset. Gambar akan membantu pengguna mengenali aset yang dipilih.
            </div>
          )}
        </div>
        <div className="p-6 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            {asset?.category?.name || 'Kategori tidak tersedia'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{asset?.name}</h2>
          <p className="text-sm text-slate-600">{asset?.location || 'Lokasi tidak disebutkan'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Skema Sewa</p>
              <p className="text-slate-900 font-semibold mt-1">{asset?.pricingSchemeJson?.unit || 'Belum diatur'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Ketersediaan</p>
              <p className="text-slate-900 font-semibold mt-1">{asset?.availableQuantity ?? 0} / {asset?.capacity ?? 0}</p>
            </div>
          </div>
        </div>
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
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Calendar className="mr-2 text-blue-600" /> {isEditing ? 'Perbarui Detail Penggunaan' : 'Detail Penggunaan'}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{bookingContext.eventLabel}</label>
              <input type="text" {...register('eventName')} className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-blue-500 focus:border-blue-500 ${errors.eventName ? 'border-red-500' : 'border-slate-200'}`} placeholder={bookingContext.eventPlaceholder} />
              {errors.eventName && <p className="mt-1 text-xs text-red-500">{errors.eventName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai</label>
                <input type="datetime-local" {...register('startDatetime')} className={`w-full p-3 bg-slate-50 border rounded-xl ${errors.startDatetime ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.startDatetime && <p className="mt-1 text-xs text-red-500">{errors.startDatetime.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Selesai</label>
                <input type="datetime-local" {...register('endDatetime')} className={`w-full p-3 bg-slate-50 border rounded-xl ${errors.endDatetime ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.endDatetime && <p className="mt-1 text-xs text-red-500">{errors.endDatetime.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{bookingContext.participantLabel}</label>
              <input
                type="number"
                min="1"
                {...register('participantCount')}
                className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-blue-500 focus:border-blue-500 ${errors.participantCount ? 'border-red-500' : 'border-slate-200'}`}
                placeholder={bookingContext.participantPlaceholder}
              />
              {errors.participantCount && <p className="mt-1 text-xs text-red-500">{errors.participantCount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{bookingContext.purposeLabel}</label>
              <textarea rows={3} {...register('purpose')} className={`w-full p-3 bg-slate-50 border rounded-xl ${errors.purpose ? 'border-red-500' : 'border-slate-200'}`} placeholder={bookingContext.purposePlaceholder}></textarea>
              {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose.message}</p>}
            </div>

            {startDatetime && endDatetime && !errors.endDatetime && (
              <PriceEstimate 
                assetId={id} 
                start={startDatetime} 
                end={endDatetime} 
              />
            )}

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
              Silakan unggah Surat Pengantar resmi atau Proposal Kegiatan dalam format PDF.
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
              />
              <Upload className="mx-auto text-slate-400 mb-4" size={40} />
              <p className="text-slate-600 font-medium">
                {docFile ? docFile.name : 'Klik atau drag untuk memilih file dokumen'}
              </p>
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
              <p><span className="font-semibold w-32 inline-block">{bookingContext.eventLabel}</span>: {eventName}</p>
              <p><span className="font-semibold w-32 inline-block">{bookingContext.participantLabel}</span>: {participantCount}</p>
              <p><span className="font-semibold w-32 inline-block">Waktu</span>: {startDatetime} - {endDatetime}</p>
              <p><span className="font-semibold w-32 inline-block">{bookingContext.purposeLabel}</span>: {purpose}</p>
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
