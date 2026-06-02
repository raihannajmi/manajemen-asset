import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { 
  Plus, 
  Edit, 
  Search, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  FileText,
  X,
  AlertCircle,
  Percent,
  CheckCircle,
  Building
} from 'lucide-react';

const BudgetManagement = () => {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState([]);
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Year selector
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Unit Usaha Modal Form State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitPic, setUnitPic] = useState('');

  // Budget Limit Modal Form State (Alokasi Pagu)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetMode, setBudgetMode] = useState('CREATE'); // CREATE / UPDATE
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [unitUsahaId, setUnitUsahaId] = useState('');
  const [allocatedQuota, setAllocatedQuota] = useState('');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());

  // Absorb (Penyerapan) Modal Form State
  const [isAbsorbModalOpen, setIsAbsorbModalOpen] = useState(false);
  const [activeBudgetLimit, setActiveBudgetLimit] = useState(null);
  const [absorbAmount, setAbsorbAmount] = useState('');
  const [activityName, setActivityName] = useState('');
  const [referenceType, setReferenceType] = useState('INTERNAL_ACTIVITY');
  const [receiptUrl, setReceiptUrl] = useState('');

  // History Modal Form State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyBudget, setHistoryBudget] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const budgetsRes = await api.get('/budgets', {
        params: { fiscalYear: selectedYear }
      });
      setBudgets(budgetsRes.data);

      const unitsRes = await api.get('/budgets/unit-usaha');
      setUnits(unitsRes.data);

      const summaryRes = await api.get('/budgets/summary', {
        params: { fiscalYear: selectedYear }
      });
      setSummary(summaryRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil data pagu anggaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets/unit-usaha', {
        code: unitCode.toUpperCase(),
        name: unitName,
        picName: unitPic || null
      });
      setIsUnitModalOpen(false);
      setUnitCode('');
      setUnitName('');
      setUnitPic('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat unit usaha baru.');
    }
  };

  const handleOpenBudgetModal = () => {
    setBudgetMode('CREATE');
    setUnitUsahaId('');
    setAllocatedQuota('');
    setFiscalYear(selectedYear);
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditBudget = (b) => {
    setBudgetMode('UPDATE');
    setSelectedBudget(b);
    setUnitUsahaId(b.unitUsahaId);
    setAllocatedQuota(b.allocatedQuota);
    setFiscalYear(b.fiscalYear);
    setIsBudgetModalOpen(true);
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        unitUsahaId,
        allocatedQuota: parseFloat(allocatedQuota),
        fiscalYear: parseInt(fiscalYear)
      };

      if (budgetMode === 'CREATE') {
        await api.post('/budgets', payload);
      } else {
        await api.put(`/budgets/${selectedBudget.id}`, {
          allocatedQuota: parseFloat(allocatedQuota)
        });
      }
      setIsBudgetModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengalokasikan pagu anggaran.');
    }
  };

  const handleOpenAbsorb = (b) => {
    setActiveBudgetLimit(b);
    setAbsorbAmount('');
    setActivityName('');
    setReferenceType('INTERNAL_ACTIVITY');
    setReceiptUrl('');
    setIsAbsorbModalOpen(true);
  };

  const handleAbsorbSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/budgets/${activeBudgetLimit.id}/absorb`, {
        amount: parseFloat(absorbAmount),
        activityName,
        referenceType,
        receiptUrl: receiptUrl || null
      });
      setIsAbsorbModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mencatat penyerapan anggaran.');
    }
  };

  const handleOpenHistory = async (b) => {
    try {
      const res = await api.get(`/budgets/${b.id}`);
      setHistoryBudget(res.data);
      setHistoryList(res.data.absorptions || []);
      setIsHistoryModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil riwayat penyerapan.');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pagu & Penyerapan Anggaran</h1>
          <p className="text-slate-500 text-sm mt-1">Alokasi anggaran unit usaha dan pantau penyerapan secara real-time.</p>
        </div>
        <div className="flex space-x-2">
          {user?.role === 'PIMPINAN' && (
            <>
              <button
                onClick={() => setIsUnitModalOpen(true)}
                className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
              >
                Tambah Unit Usaha
              </button>
              <button
                onClick={handleOpenBudgetModal}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              >
                <Plus size={16} className="mr-2" /> Alokasikan Pagu
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start space-x-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <span className="text-indigo-100 text-sm font-medium">Total Alokasi Pagu</span>
            <h2 className="text-2xl font-bold mt-4">{formatRupiah(summary.totalAllocated)}</h2>
            <div className="flex items-center text-indigo-100 text-xs mt-2">
              <Calendar size={14} className="mr-1" />
              <span>Tahun Fiskal {summary.fiscalYear}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Total Penyerapan</span>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{formatRupiah(summary.totalAbsorbed)}</h2>
            <div className="flex items-center text-emerald-600 text-xs mt-2 font-medium">
              <TrendingUp size={14} className="mr-1" />
              <span>Serapan Rata-Rata: {summary.overallRate}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Sisa Pagu Anggaran</span>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{formatRupiah(summary.totalRemaining)}</h2>
            <div className="text-slate-400 text-xs mt-2">
              <span>Dana cadangan tersedia</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-slate-500 text-sm font-medium">Tahun Anggaran</span>
            <div className="mt-4 flex items-center space-x-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-700"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Budget Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <BarChart3 size={48} className="text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 text-lg">Belum Ada Pagu Anggaran</h3>
          <p className="text-slate-400 text-sm mt-1">Silakan alokasikan pagu anggaran tahunan untuk unit usaha terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => (
            <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{b.unitUsaha.name}</h3>
                      <p className="text-slate-400 text-xs">PIC: {b.unitUsaha.picName || 'Belum Ditunjuk'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {user?.role === 'PIMPINAN' && (
                      <button
                        onClick={() => handleOpenEditBudget(b)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all"
                        title="Edit Alokasi"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-slate-400 text-xs block">Pagu Dialokasikan</span>
                    <span className="font-bold text-slate-800 text-sm">{formatRupiah(b.allocatedQuota)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Total Penyerapan</span>
                    <span className="font-bold text-slate-800 text-sm">{formatRupiah(b.totalAbsorbed)}</span>
                  </div>
                </div>

                {/* Progress Bar Serapan */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Persentase Serapan</span>
                    <span className={`${b.absorptionRate > 90 ? 'text-red-600' : 'text-blue-600'}`}>
                      {b.absorptionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.absorptionRate > 90 
                          ? 'bg-red-500' 
                          : b.absorptionRate > 75 
                          ? 'bg-amber-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(b.absorptionRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sisa Tersedia: {formatRupiah(b.remaining)}</span>
                    {b.remaining === 0 && <span className="text-red-500 font-medium">Habis</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleOpenHistory(b)}
                  className="flex-1 px-4 py-2 border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs transition-all text-center"
                >
                  Riwayat Serapan
                </button>
                {user?.role === 'ADMIN_ASET' && b.remaining > 0 && (
                  <button
                    onClick={() => handleOpenAbsorb(b)}
                    className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-semibold text-xs transition-all text-center"
                  >
                    Catat Serapan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNIT USAHA CREATE MODAL */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Tambah Unit Usaha Baru</h3>
              <button onClick={() => setIsUnitModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kode Unit</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: UNNES_PRESS"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Unit Usaha</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penerbitan UNNES Press"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. Budi Santoso"
                  value={unitPic}
                  onChange={(e) => setUnitPic(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Tambah Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUDGET LIMIT CREATE/UPDATE MODAL (ALOKASI) */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {budgetMode === 'CREATE' ? 'Alokasikan Pagu Anggaran' : 'Sesuaikan Pagu Anggaran'}
              </h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="p-6 space-y-4">
              {budgetMode === 'CREATE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unit Usaha</label>
                    <select
                      required
                      value={unitUsahaId}
                      onChange={(e) => setUnitUsahaId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="">Pilih Unit Usaha</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tahun Fiskal</label>
                    <input
                      type="number"
                      required
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nominal Pagu (Rupiah)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={allocatedQuota}
                  onChange={(e) => setAllocatedQuota(e.target.value)}
                  placeholder="Contoh: 150000000"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  {budgetMode === 'CREATE' ? 'Alokasikan' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABSORPTION MODAL (CATAT SERAPAN) */}
      {isAbsorbModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Catat Penyerapan Anggaran</h3>
              <button onClick={() => setIsAbsorbModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAbsorbSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50/75 p-4 rounded-xl text-xs text-blue-700 space-y-1">
                <p className="font-bold text-blue-900">{activeBudgetLimit?.unitUsaha?.name}</p>
                <p>Maksimal serapan tersedia: <span className="font-bold">{formatRupiah(activeBudgetLimit?.remaining)}</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Aktivitas / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian tinta cetak berkala"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Jumlah Serapan (Rupiah)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activeBudgetLimit?.remaining}
                  value={absorbAmount}
                  onChange={(e) => setAbsorbAmount(e.target.value)}
                  placeholder="Masukkan nominal"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Jenis Acuan</label>
                <select
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="INTERNAL_ACTIVITY">Kegiatan Internal Mandiri</option>
                  <option value="OPERATIONAL_EXPENSE">Beban Operasional Gedung</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Link Bukti Nota / SPJ (Opsional)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAbsorbModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Catat Penyerapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY ABSORPTION MODAL (RIWAYAT SERAPAN) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Riwayat Penyerapan Anggaran</h3>
                <p className="text-slate-400 text-xs mt-0.5">{historyBudget?.unitUsaha?.name} — {historyBudget?.fiscalYear}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {historyList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle size={36} className="text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Belum ada dana yang diserap dari pagu ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div key={item.id} className="bg-slate-50 hover:bg-slate-100/50 p-4 rounded-xl border border-slate-100 flex items-start justify-between transition-all">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 text-sm">{item.activityName}</p>
                        <p className="text-slate-400 text-[10px]">
                          Dicatat pada: {new Date(item.absorbedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-slate-400 text-[10px] uppercase font-bold text-blue-600">
                          {item.referenceType?.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <span className="font-bold text-slate-800 text-sm">{formatRupiah(item.amountAbsorbed)}</span>
                        {item.receiptUrl && (
                          <a
                            href={item.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-blue-600 hover:text-blue-700 font-medium hover:underline text-xs"
                          >
                            Nota Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
