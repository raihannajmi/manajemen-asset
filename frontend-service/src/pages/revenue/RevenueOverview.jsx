import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  FileText,
  X,
  AlertCircle,
  Download,
  Upload,
  Layers,
  FileCheck
} from 'lucide-react';

const RevenueOverview = () => {
  const { user } = useAuthStore();
  const [revenues, setRevenues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Year selector for reports
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Revenue Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceUnit, setSourceUnit] = useState('UNNES_PRESS');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');

  // Bulk Import Modal Form State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedUnit, startDate, endDate, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const revenuesRes = await api.get('/revenue/external', {
        params: {
          sourceUnit: selectedUnit || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });
      setRevenues(revenuesRes.data);

      const summaryRes = await api.get('/revenue/external/summary', {
        params: { fiscalYear: selectedYear }
      });
      setSummary(summaryRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil data revenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRevenue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/revenue/external', {
        sourceUnit,
        amount: parseFloat(amount),
        transactionDate: new Date(transactionDate),
        referenceNo,
        description
      });
      setIsModalOpen(false);
      setAmount('');
      setReferenceNo('');
      setDescription('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mencatat revenue baru.');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      let records = [];
      try {
        records = JSON.parse(importJsonText);
      } catch (jsonErr) {
        throw new Error('Format JSON tidak valid. Pastikan data berupa Array JSON.');
      }

      await api.post('/revenue/import', { records });
      setIsImportModalOpen(false);
      setImportJsonText('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengimpor data bulk.');
    }
  };

  const handleExportFile = async (reportType) => {
    try {
      const response = await api.get('/reports/export', {
        params: {
          type: reportType,
          fiscalYear: selectedYear
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${reportType}-${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      setError('Gagal mengekspor laporan.');
    }
  };

  const filteredRevenues = revenues.filter(rev => 
    rev.referenceNo?.toLowerCase().includes(search.toLowerCase()) ||
    rev.description?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Revenue & Ekspor Laporan</h1>
          <p className="text-slate-500 text-sm mt-1">Catat revenue eksternal unit usaha luar dan ekspor laporan konsolidasi.</p>
        </div>
        {user?.role === 'ADMIN_ASET' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              <Upload size={16} className="mr-2" /> Import Bulk
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} className="mr-2" /> Catat Revenue
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start space-x-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Export Report Card Toolbar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-lg font-bold tracking-wide">Pusat Ekspor Laporan Finansial & Operasional</h2>
            <p className="text-indigo-200 text-xs mt-1">Unduh laporan resmi format CSV instan untuk dianalisis oleh Pimpinan.</p>
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-xs text-indigo-300 font-semibold uppercase">Pilih Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-indigo-800/80 hover:bg-indigo-800 border border-indigo-700 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white transition-all"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <button
              onClick={() => handleExportFile('revenue')}
              className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              <Download size={14} className="mr-2" /> Lap. Pendapatan
            </button>
            <button
              onClick={() => handleExportFile('expenses')}
              className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              <Download size={14} className="mr-2" /> Lap. Beban
            </button>
            <button
              onClick={() => handleExportFile('budget')}
              className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              <Download size={14} className="mr-2" /> Lap. Pagu
            </button>
            <button
              onClick={() => handleExportFile('occupancy')}
              className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              <Download size={14} className="mr-2" /> Lap. Okupansi
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">External Revenue Tahun Ini</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{formatRupiah(summary.totalRevenue)}</h2>
            <div className="text-slate-400 text-xs mt-2">
              <span>Dana terakumulasi dari seluruh unit eksternal</span>
            </div>
          </div>

          {summary.items?.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm font-medium">Unit: {item.sourceUnit}</span>
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Layers size={20} /></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mt-4">{formatRupiah(item.totalAmount)}</h2>
              <div className="text-slate-400 text-xs mt-2">
                <span>Total penyerapan laba tahun berjalan</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar Filter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor referensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/75 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-500 text-sm font-medium">
            <Filter size={16} />
            <span>Filter Unit:</span>
          </div>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          >
            <option value="">Semua Unit Luar</option>
            <option value="UNNES_PRESS">UNNES Press</option>
            <option value="PUSLAKES">PUSLAKES</option>
            <option value="ASRAMA">Asrama</option>
            <option value="BOAB">BOAB</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          />
          <span className="text-slate-400 text-xs">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRevenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <CreditCard size={48} className="text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 text-lg">Tidak Ada Catatan Revenue</h3>
          <p className="text-slate-400 text-sm mt-1">Belum ada pendapatan eksternal yang dicatat atau diimpor untuk kriteria ini.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-4 px-6">Tanggal Transaksi</th>
                  <th className="py-4 px-6">Unit Usaha Asal</th>
                  <th className="py-4 px-6">Nomor Referensi</th>
                  <th className="py-4 px-6">Keterangan</th>
                  <th className="py-4 px-6 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6 font-medium text-slate-800 flex items-center">
                      <Calendar size={16} className="text-slate-400 mr-2" />
                      {new Date(rev.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                        {rev.sourceUnit}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">{rev.referenceNo}</td>
                    <td className="py-4 px-6 max-w-xs truncate">{rev.description || '-'}</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-800">{formatRupiah(rev.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVENUE MANUAL CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Catat Pendapatan Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRevenue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unit Usaha Eksternal</label>
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="UNNES_PRESS">UNNES Press</option>
                  <option value="PUSLAKES">PUSLAKES</option>
                  <option value="ASRAMA">Asrama</option>
                  <option value="BOAB">BOAB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nominal Setoran (Rupiah)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 7500000"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tanggal Setor</label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nomor Referensi Setor (Harus Unik)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TRX-2026-0001"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Keterangan / Keterangan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Tulis rincian setoran..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Import Bulk Data Setoran</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 text-slate-600 border border-slate-100">
                <p className="font-bold flex items-center text-slate-700"><FileCheck size={14} className="mr-1 text-emerald-600" /> Contoh Format Array JSON:</p>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto font-mono text-[10px]">
{`[
  {
    "sourceUnit": "UNNES_PRESS",
    "amount": 2500000,
    "transactionDate": "2026-06-01",
    "referenceNo": "REF-PRESS-01",
    "description": "Laba penjualan buku kuartal 1"
  }
]`}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Paste Array JSON Data</label>
                <textarea
                  required
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows="6"
                  placeholder="Paste JSON array data setoran di sini..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-mono text-xs transition-all"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Impor Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueOverview;
