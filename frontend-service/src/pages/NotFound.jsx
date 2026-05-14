import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <div className="text-[180px] font-black leading-none bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
              <SearchX size={40} className="text-blue-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau tidak pernah ada. Pastikan URL yang Anda masukkan sudah benar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-sm"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50"
          >
            <Home size={18} />
            Ke Dashboard
          </button>
        </div>

        {/* Decorative orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
