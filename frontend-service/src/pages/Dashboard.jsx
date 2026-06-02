import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell
} from 'recharts';
import { 
  TrendingUp, Package, Clock, Wallet, Calendar, ClipboardList, Loader2, ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [revenuePeriod, setRevenuePeriod] = useState('MONTHLY'); // DAILY, MONTHLY, YEARLY

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary', revenuePeriod],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary', { params: { period: revenuePeriod } });
      return res.data;
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const { stats, analytics, dueSoonRentals, budgetSummary } = data;
  const isTenant = user?.role === 'PENYEWA';

  let statCards = [];

  if (isTenant) {
    statCards = [
      { label: 'Sewa Aktif', value: stats.activeRentals, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Menunggu Persetujuan', value: stats.pendingRentals, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Total Pengajuan Saya', value: stats.myRentals, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Total Aset Terdaftar', value: stats.totalAssets, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    ];
  } else {
    statCards = [
      { label: 'Total Aset', value: stats.totalAssets, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Tingkat Okupansi', value: `${stats.occupancyRate || 0}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Jatuh Tempo (30 Hari)', value: stats.dueSoonCount || 0, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Total Pendapatan', value: `Rp ${Number(stats.totalRevenue).toLocaleString('id-ID')}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    ];
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ringkasan Operasional</h1>
        <p className="text-slate-500 mt-1">Pantau performa aset {isTenant ? 'sewa Anda' : 'dan keuangan'} secara real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {!isTenant && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="text-blue-600" size={20} /> Tren Pendapatan
                </h2>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none font-semibold text-slate-700"
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                >
                  <option value="DAILY">30 Hari Terakhir</option>
                  <option value="MONTHLY">12 Bulan Terakhir</option>
                  <option value="YEARLY">5 Tahun Terakhir</option>
                </select>
              </div>
              <div className="h-80 w-full">
                {analytics?.revenueData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}Jt`}
                      />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                        activeDot={{r: 8}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-400">
                    Belum ada data pendapatan untuk periode ini.
                  </div>
                )}
              </div>
            </div>

            {/* Top Assets Chart */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} /> Utilisasi Aset Tertinggi
                </h2>
              </div>
              <div className="h-80 w-full">
                {analytics?.topAssets?.length > 0 ? (
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
                        formatter={(value) => [`${value} kali disewa`, 'Total Booking']}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                        {analytics.topAssets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-400">
                    Belum ada data persewaan aset.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower Grid: Due Soon Leases & YTD Budget Absorption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Due Soon Leases */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="text-rose-600" size={20} /> Kontrak Segera Berakhir (30 Hari)
              </h2>
              {dueSoonRentals?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                        <th className="pb-3">Penyewa</th>
                        <th className="pb-3">Aset</th>
                        <th className="pb-3">Tanggal Berakhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dueSoonRentals.map((rental) => (
                        <tr key={rental.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800">{rental.tenantName}</td>
                          <td className="py-3">{rental.assetName}</td>
                          <td className="py-3 text-rose-600 font-medium">
                            {new Date(rental.endDatetime).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm">
                  Tidak ada kontrak sewa yang akan segera berakhir.
                </div>
              )}
            </div>

            {/* YTD Budget Absorption */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20} /> Realisasi Pagu Anggaran Unit Usaha
              </h2>
              {budgetSummary?.length > 0 ? (
                <div className="space-y-4">
                  {budgetSummary.map((b, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{b.unitUsahaName}</span>
                        <span className="text-indigo-600">
                          {b.absorptionRate}% ({b.totalAbsorbed.toLocaleString('id-ID')} / {b.allocatedQuota.toLocaleString('id-ID')})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${Math.min(b.absorptionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm">
                  Belum ada alokasi pagu anggaran untuk tahun berjalan.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
