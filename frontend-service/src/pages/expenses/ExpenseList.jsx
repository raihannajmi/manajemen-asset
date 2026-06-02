import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  FileText,
  X,
  AlertCircle
} from 'lucide-react';

const ExpenseList = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE or UPDATE
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [periodDate, setPeriodDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Category Modal Form State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const expensesRes = await api.get('/expenses', {
        params: {
          categoryId: selectedCategory || undefined,
          periodDate: selectedPeriod || undefined
        }
      });
      setExpenses(expensesRes.data.data || []);

      const categoriesRes = await api.get('/expenses/categories');
      setCategories(categoriesRes.data);

      const summaryRes = await api.get('/expenses/summary');
      setSummary(summaryRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil data beban operasional.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setCategoryId('');
    setAmount('');
    setPeriodDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReceiptUrl('');
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (exp) => {
    setModalMode('UPDATE');
    setSelectedExpense(exp);
    setCategoryId(exp.categoryId);
    setAmount(exp.amount);
    setPeriodDate(new Date(exp.periodDate).toISOString().split('T')[0]);
    setDescription(exp.description || '');
    setReceiptUrl(exp.receiptUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        periodDate: new Date(periodDate),
        description,
        receiptUrl: receiptUrl || null
      };

      if (modalMode === 'CREATE') {
        await api.post('/expenses', payload);
      } else {
        await api.put(`/expenses/${selectedExpense.id}`, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan beban operasional.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan beban operasional ini?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus beban operasional.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses/categories', {
        code: catCode.toUpperCase(),
        name: catName,
        description: catDesc
      });
      setIsCatModalOpen(false);
      setCatCode('');
      setCatName('');
      setCatDesc('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah kategori beban.');
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description?.toLowerCase().includes(search.toLowerCase()) ||
    exp.category?.name?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Beban Operasional</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau seluruh pengeluaran internal (listrik, air, internet, perawatan).</p>
        </div>
        {user?.role === 'ADMIN_ASET' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
            >
              Tambah Kategori
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} className="mr-2" /> Catat Beban Baru
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between">
              <span className="text-blue-100 text-sm font-medium">Beban Operasional Tahun Ini</span>
              <div className="p-2 bg-white/10 rounded-lg"><Wallet size={20} /></div>
            </div>
            <h2 className="text-2xl font-bold mt-4">{formatRupiah(summary.grandTotal || 0)}</h2>
            <div className="flex items-center text-blue-100 text-xs mt-2">
              <TrendingUp size={14} className="mr-1" />
              <span>Rekapitulasi beban tahun {summary.year}</span>
            </div>
          </div>

          {summary.byCategory?.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm font-medium">Beban: {item.name}</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mt-4">{formatRupiah(item.total || 0)}</h2>
              <div className="text-slate-400 text-xs mt-2">
                <span>Akumulasi pengeluaran kategori</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari deskripsi beban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/75 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-500 text-sm font-medium">
            <Filter size={16} />
            <span>Filter:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <Wallet size={48} className="text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 text-lg">Tidak Ada Catatan Beban</h3>
          <p className="text-slate-400 text-sm mt-1">Belum ada beban operasional yang dicatat untuk kriteria saat ini.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-4 px-6">Tanggal Periode</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Deskripsi</th>
                  <th className="py-4 px-6 text-right">Nominal</th>
                  <th className="py-4 px-6">Bukti Fisik</th>
                  {user?.role === 'ADMIN_ASET' && <th className="py-4 px-6 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6 font-medium text-slate-800 flex items-center">
                      <Calendar size={16} className="text-slate-400 mr-2" />
                      {new Date(exp.periodDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {exp.category?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">{exp.description}</td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-800">{formatRupiah(exp.amount)}</td>
                    <td className="py-4 px-6">
                      {exp.receiptUrl ? (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium hover:underline text-xs"
                        >
                          <FileText size={14} className="mr-1" /> Lihat Nota
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">Tidak ada nota</span>
                      )}
                    </td>
                    {user?.role === 'ADMIN_ASET' && (
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenUpdateModal(exp)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSE CREATE/UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {modalMode === 'CREATE' ? 'Catat Beban Operasional' : 'Ubah Beban Operasional'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kategori</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nominal (Rupiah)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 1500000"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tanggal Periode</label>
                <input
                  type="date"
                  required
                  value={periodDate}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi / Keterangan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Tulis detail tagihan/keperluan..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Link Bukti Nota (Opsional)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://drive.google.com/... (Nota tagihan)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
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
                  {modalMode === 'CREATE' ? 'Simpan Catatan' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATE MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Tambah Kategori Beban</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kode Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TELEPON"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beban Telepon"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows="3"
                  placeholder="Tulis kegunaan beban..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
