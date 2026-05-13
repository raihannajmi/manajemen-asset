import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Menu,
  X
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['ADMIN_ASET', 'PIMPINAN', 'PENYEWA'] },
    { name: 'Daftar Aset', icon: <Package size={20} />, path: '/assets', roles: ['ADMIN_ASET', 'PIMPINAN', 'PENYEWA'] },
    { name: 'Pengajuan Saya', icon: <FileText size={20} />, path: '/my-rentals', roles: ['PENYEWA'] },
    { name: 'Verifikasi Pengajuan', icon: <FileText size={20} />, path: '/verify-rentals', roles: ['ADMIN_ASET'] },
    { name: 'Persetujuan', icon: <FileText size={20} />, path: '/approvals', roles: ['PIMPINAN'] },
    { name: 'Riwayat Audit', icon: <History size={20} />, path: '/audit-logs', roles: ['ADMIN_ASET'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="bg-blue-600 rounded-lg p-1.5 mr-3">
            <Package className="text-white" size={20} />
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-800 text-lg">AssetSys</span>}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut size={20} className={isSidebarOpen ? 'mr-3' : ''} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-all">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
