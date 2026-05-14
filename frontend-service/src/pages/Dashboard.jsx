import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, Package, Clock, ArrowUpRight, ArrowDownRight,
  Wallet, Calendar, ClipboardList, Loader2
} from 'lucide-react';
import api from '../lib/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const { stats, analytics } = data;

  const statCards = [
    { 
      label: 'Total Pendapatan', 
      value: `Rp ${stats.totalRevenue.toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Sewa Aktif', 
      value: stats.activeRentals, 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Aset', 
      value: stats.totalAssets, 
      icon: Package, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Antrean Verifikasi', 
      value: stats.newSubmissions, 
      icon: ClipboardList, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ringkasan Operasional</h1>
        <p className="text-slate-500 mt-1">Pantau performa aset dan keuangan secara real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center">
                <ArrowUpRight size={14} className="mr-1" /> +12%
              </span>
            </div>
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Tren Pendapatan</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none">
              <option>6 Bulan Terakhir</option>
              <option>12 Bulan Terakhir</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 8}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Assets Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Utilisasi Aset Tertinggi</h2>
            <TrendingUp size={20} className="text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topAssets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#1e293b', fontSize: 12, fontWeight: 600}} 
                  width={150}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                  {analytics.topAssets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Pemberitahuan Sistem</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">5 Pengajuan perlu persetujuan</div>
                <div className="text-xs text-slate-500">Batas waktu hari ini jam 16:00</div>
              </div>
              <button className="text-sm font-bold text-orange-600 hover:underline">Periksa</button>
            </div>
            <div className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Wallet size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">Laporan Keuangan April Tersedia</div>
                <div className="text-xs text-slate-500">Peningkatan pendapatan sebesar 15%</div>
              </div>
              <button className="text-sm font-bold text-blue-600 hover:underline">Unduh</button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Bantuan Cepat</h2>
            <p className="text-blue-100 text-sm mb-6">Butuh panduan penggunaan dashboard atau export laporan?</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
              Buka Panduan
            </button>
          </div>
          <TrendingUp size={120} className="absolute -right-8 -bottom-8 text-blue-500 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
