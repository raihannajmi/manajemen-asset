import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Calendar, Users, MapPin, FileText, CheckCircle, XCircle, AlertTriangle, FileSignature, Activity, Clock, Shield, RefreshCw } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/axios';

const STATUS_BADGES = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION: 'bg-orange-100 text-orange-700',
  INVOICE_GENERATED: 'bg-indigo-100 text-indigo-700',
  WAITING_PAYMENT: 'bg-purple-100 text-purple-700',
  ACTIVE_RENTAL: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-slate-800 text-white',
};

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { data: rental, isLoading } = useQuery({
    queryKey: ['rental', id],
    queryFn: async () => {
      const res = await api.get(`/rentals/${id}`);
      return res.data;
    }
  });

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['order-timeline', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}/timeline`);
      return res.data;
    },
    enabled: ['ADMIN_ASET', 'PIMPINAN'].includes(user?.role),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => api.post(`/rentals/${id}/verify`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries(['rental', id]);
      queryClient.invalidateQueries(['order-timeline', id]);
      queryClient.invalidateQueries(['orders']);
      navigate('/orders');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (action) => api.post(`/rentals/${id}/approve`, { action, note }),
    onSuccess: () => {
      queryClient.invalidateQueries(['rental', id]);
      queryClient.invalidateQueries(['order-timeline', id]);
      queryClient.invalidateQueries(['orders']);
      navigate('/orders');
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (!rental) return <div className="text-center py-20">Data tidak ditemukan.</div>;

  const isAdmin = user?.role === 'ADMIN_ASET';
  const isPimpinan = user?.role === 'PIMPINAN';
  const isTenant = user?.role === 'PENYEWA';
  const isAdminOrPimpinan = isAdmin || isPimpinan;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
        <ArrowLeft size={16} className="mr-2" /> Kembali
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detail Pengajuan</h1>
          <p className="text-slate-500 mt-1 font-mono">{rental.requestNo}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${STATUS_BADGES[rental.status]}`}>
          {rental.status?.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Data Pemohon</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-slate-500">Nama Lengkap</p>
                <p className="font-semibold text-slate-900">{rental.tenantUser.fullName}</p>
              </div>
              <div>
                <p className="text-slate-500">Organisasi</p>
                <p className="font-semibold text-slate-900">{rental.tenantUser.organization || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-900">{rental.tenantUser.email}</p>
              </div>
              <div>
                <p className="text-slate-500">No. Telepon</p>
                <p className="font-semibold text-slate-900">{rental.tenantUser.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Asset & Event Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Detail Sewa</h2>
            <div className="mb-4">
              <p className="text-slate-500 text-sm">Nama Acara</p>
              <p className="font-semibold text-slate-900 text-lg">{rental.eventName}</p>
            </div>
            <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
              <div>
                <p className="text-slate-500">Aset yang Disewa</p>
                <Link to={`/catalog/${rental.assetId}`} className="font-semibold text-blue-600 hover:underline">{rental.asset.name}</Link>
              </div>
              <div>
                <p className="text-slate-500">Jumlah Peserta</p>
                <p className="font-semibold text-slate-900">{rental.participantCount} orang</p>
              </div>
              <div>
                <p className="text-slate-500">Mulai</p>
                <p className="font-semibold text-slate-900">{new Date(rental.startDatetime).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-slate-500">Selesai</p>
                <p className="font-semibold text-slate-900">{new Date(rental.endDatetime).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Tujuan Penyewaan</p>
              <p className="text-slate-800 mt-1">{rental.purpose}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Dokumen Persyaratan</h2>
            {rental.documents.length === 0 ? (
              <p className="text-slate-500 text-sm">Tidak ada dokumen yang diunggah.</p>
            ) : (
              <div className="space-y-3">
                {rental.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center">
                      <FileText className="text-slate-400 mr-3" size={20} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{doc.docType.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-1.5 bg-white border border-slate-200 text-blue-600 text-sm font-semibold rounded-lg hover:bg-slate-50">
                      Buka Dokumen
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions & History */}
        <div className="space-y-6">
          {/* Admin Verification Form */}
          {isAdmin && rental.status === 'SUBMITTED' && (
            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm shadow-blue-50">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><FileSignature className="mr-2 text-blue-600" size={20} /> Form Verifikasi</h3>
              <p className="text-sm text-slate-500 mb-4">Pastikan dokumen pemohon valid sebelum meneruskannya ke Pimpinan.</p>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm"
                rows={3}
                placeholder="Catatan untuk pimpinan (opsional)..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex justify-center items-center"
              >
                {verifyMutation.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
                Verifikasi & Teruskan
              </button>
            </div>
          )}

          {/* Pimpinan Approval Form */}
          {isPimpinan && rental.status === 'PENDING_APPROVAL' && (
            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm shadow-blue-50">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><CheckCircle className="mr-2 text-blue-600" size={20} /> Form Keputusan</h3>
              <p className="text-sm text-slate-500 mb-4">Berikan persetujuan, penolakan, atau minta revisi dokumen.</p>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm"
                rows={3}
                placeholder="Catatan persetujuan / alasan penolakan..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <div className="space-y-3">
                <button
                  onClick={() => approveMutation.mutate('APPROVED')}
                  disabled={approveMutation.isPending}
                  className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                >
                  Setujui Pengajuan
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => approveMutation.mutate('REVISION')}
                    disabled={approveMutation.isPending || !note.trim()}
                    className="w-full py-2 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition disabled:opacity-50"
                  >
                    Minta Revisi
                  </button>
                  <button
                    onClick={() => approveMutation.mutate('REJECTED')}
                    disabled={approveMutation.isPending || !note.trim()}
                    className="w-full py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition disabled:opacity-50"
                  >
                    Tolak Sewa
                  </button>
                </div>
                {(!note.trim() && rental.status === 'PENDING_APPROVAL') && (
                  <p className="text-xs text-slate-400 text-center mt-2">Catatan wajib diisi untuk Revisi/Tolak.</p>
                )}
              </div>
            </div>
          )}

          {/* Feedback Display for Tenant */}
          {isTenant && ['REJECTED', 'REVISION'].includes(rental.status) && rental.statusHistory.length > 0 && (
            <div className={`p-5 rounded-2xl border ${rental.status === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start">
                <AlertTriangle className={`mr-3 mt-0.5 ${rental.status === 'REJECTED' ? 'text-red-500' : 'text-orange-500'}`} size={20} />
                <div>
                  <h4 className={`font-bold ${rental.status === 'REJECTED' ? 'text-red-800' : 'text-orange-800'}`}>
                    {rental.status === 'REJECTED' ? 'Pengajuan Ditolak' : 'Perlu Revisi Dokumen'}
                  </h4>
                  <p className={`text-sm mt-1 ${rental.status === 'REJECTED' ? 'text-red-600' : 'text-orange-700'}`}>
                    Catatan Pimpinan: "{rental.statusHistory[0]?.note || '-'}"
                  </p>
                  {rental.status === 'REVISION' && (
                    <button
                      onClick={() => navigate(`/rentals/${id}/edit`)}
                      className="mt-4 px-6 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-sm"
                    >
                      Edit & Submit Ulang
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- SPRINT 5 & 6: BILLING ACTIONS --- */}

          {/* Admin: Generate Invoice */}
          {isAdmin && rental.status === 'APPROVED' && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm shadow-indigo-50">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><FileText className="mr-2 text-indigo-600" size={20} /> Terbitkan Invoice</h3>
              <p className="text-sm text-slate-500 mb-4">Pengajuan telah disetujui Pimpinan. Masukkan Nomor VA lalu terbitkan invoice agar tagihan resmi dapat dibuat.</p>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Virtual Account (VA) Pembayaran</label>
                <input 
                  type="text" 
                  id="vaNumber"
                  placeholder="Contoh: 88000123456789" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                onClick={async () => {
                  const vaInput = document.getElementById('vaNumber').value;
                  if (!vaInput) {
                    alert('Harap masukkan Nomor Virtual Account terlebih dahulu!');
                    return;
                  }
                  try {
                    await api.post(`/rentals/${id}/invoices`, { manualVaNumber: vaInput });
                    queryClient.invalidateQueries(['rental', id]);
                  } catch (e) {
                    alert('Gagal membuat invoice: ' + e.response?.data?.message);
                  }
                }}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
              >
                Generate Invoice
              </button>
            </div>
          )}


          {/* Admin: Generate Contract (after Invoice created) */}
          {isAdmin && rental.status === 'INVOICE_GENERATED' && (
            <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm shadow-purple-50">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><FileSignature className="mr-2 text-purple-600" size={20} /> Terbitkan Kontrak</h3>
              <p className="text-sm text-slate-500 mb-4">Invoice sudah diterbitkan. Langkah berikutnya adalah menerbitkan surat kontrak agar penyewa bisa melakukan pembayaran.</p>
              <button
                onClick={async () => {
                  try {
                    await api.post(`/rentals/${id}/contracts`);
                    queryClient.invalidateQueries(['rental', id]);
                  } catch (e) {
                    alert('Gagal membuat kontrak: ' + e.response?.data?.message);
                  }
                }}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition"
              >
                Terbitkan Kontrak Sewa
              </button>
            </div>
          )}

          {/* Invoice Info */}
          {rental.invoice && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><FileText className="mr-2 text-slate-600" size={20} /> Tagihan (Invoice)</h3>
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">No. Invoice</span>
                  <span className="font-mono font-bold text-sm text-slate-800">{rental.invoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">Total Tagihan</span>
                  <span className="font-bold text-lg text-blue-600">Rp {rental.invoice.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                {rental.invoice.manualVaNumber && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">No. Virtual Account</span>
                    <span className="font-mono font-bold text-sm text-green-700 bg-green-50 px-2 py-1 rounded">{rental.invoice.manualVaNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${rental.invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rental.invoice.status}
                  </span>
                </div>
              </div>

              {/* Upload Payment Proof for Tenant - only when WAITING_PAYMENT */}
              {isTenant && rental.status === 'WAITING_PAYMENT' && rental.invoice.status === 'UNPAID' && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-slate-700">Transfer ke nomor VA di atas, lalu unggah bukti transfer Anda (JPEG/PNG/PDF):</p>
                  <label className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer flex justify-center items-center">
                    Upload Bukti Bayar
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('amount', rental.invoice.totalAmount);
                          formData.append('transferDate', new Date().toISOString());
                          formData.append('file', file);
                          
                          try {
                            await api.post(`/invoices/${rental.invoice.id}/payments`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            alert('Bukti pembayaran berhasil diunggah!');
                            queryClient.invalidateQueries(['rental', id]);
                          } catch (err) {
                            alert('Gagal: ' + (err.response?.data?.message || err.message));
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Contract Info */}
          {rental.contract && (
            <div className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm shadow-green-50">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><CheckCircle className="mr-2 text-green-600" size={20} /> Kontrak Sewa</h3>
              <p className="text-sm text-slate-600 mb-3">Nomor: <span className="font-mono font-semibold">{rental.contract.contractNo}</span></p>
              {rental.contract.pdfUrl ? (
                <a href={rental.contract.pdfUrl} target="_blank" rel="noreferrer" className="w-full py-2.5 block text-center bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
                  Download PDF Kontrak
                </a>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-center">
                  <p className="text-xs text-yellow-700 font-medium">⏳ PDF sedang diproses, akan tersedia dalam beberapa saat.</p>
                </div>
              )}
            </div>
          )}

          {/* Full Audit Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Timeline Order
              </h3>
              {isAdminOrPimpinan && timelineData?.timeline?.length > 0 && (
                <span className="text-xs text-slate-400">{timelineData.timeline.length} aktivitas</span>
              )}
            </div>

            {/* For Tenant: show simple status history */}
            {!isAdminOrPimpinan && (
              <div className="space-y-4">
                {rental.statusHistory.map((history, idx) => (
                  <div key={history.id} className="relative flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full z-10 mt-1" />
                      {idx !== rental.statusHistory.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-slate-800">{history.toStatus.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">{new Date(history.createdAt).toLocaleString('id-ID')}</p>
                      {history.note && <p className="text-sm text-slate-600 mt-1 italic">"{history.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* For Admin/Pimpinan: show full audit timeline */}
            {isAdminOrPimpinan && (
              isTimelineLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
              ) : (
                <div className="space-y-3">
                  {(timelineData?.timeline || []).map((entry, idx) => {
                    const isStatusChange = entry.type === 'STATUS_CHANGE';
                    const isAudit = entry.type === 'AUDIT';

                    const dotColor = isStatusChange
                      ? (entry.action === 'APPROVED' || entry.action === 'ACTIVE_RENTAL' || entry.action === 'COMPLETED') ? 'bg-green-500'
                      : (entry.action === 'REJECTED') ? 'bg-red-500'
                      : (entry.action === 'REVISION') ? 'bg-orange-500'
                      : 'bg-blue-500'
                      : 'bg-slate-400';

                    return (
                      <div key={entry.id + idx} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} z-10`} />
                          {idx !== (timelineData?.timeline?.length || 0) - 1 && (
                            <div className="w-px flex-1 bg-slate-100 mt-1 min-h-[20px]" />
                          )}
                        </div>
                        <div className="pb-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isStatusChange ? (
                              <>
                                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                  {entry.action.replace(/_/g, ' ')}
                                </span>
                                {entry.actor && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Shield size={10} /> {entry.actor}
                                    {entry.actorRole && (
                                      <span className="text-slate-400">
                                        ({typeof entry.actorRole === 'object' ? (entry.actorRole?.name || entry.actorRole?.code) : entry.actorRole})
                                      </span>
                                    )}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  {entry.action}
                                </span>
                                <span className="text-xs text-slate-500">{entry.entityType}</span>
                                {entry.meta?.ipAddress && (
                                  <span className="text-[10px] text-slate-400 ml-auto">IP: {entry.meta.ipAddress}</span>
                                )}
                              </>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 px-2 py-1 rounded">
                              "{entry.note}"
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={9} />
                            {new Date(entry.createdAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(!timelineData?.timeline || timelineData.timeline.length === 0) && (
                    <p className="text-sm text-slate-400 text-center py-4">Belum ada aktivitas.</p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetail;
