import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  LogOut, 
  User,
  Bell,
  Menu,
  X
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['ADMIN_ASET', 'PIMPINAN', 'PENYEWA'] },
    // Admin & Pimpinan - Asset Management
    { name: 'Kelola Kategori', icon: <Package size={20} />, path: '/categories', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Manajemen Aset', icon: <Package size={20} />, path: '/assets', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Aset Tambahan', icon: <Package size={20} />, path: '/additional-assets', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    // Admin & Pimpinan - Approval
    { name: 'Verifikasi Pengajuan', icon: <FileText size={20} />, path: '/verify-rentals', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Verifikasi Pembayaran', icon: <FileText size={20} />, path: '/verify-payments', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    // Pimpinan only - final approval
    { name: 'Persetujuan', icon: <FileText size={20} />, path: '/approvals', roles: ['PIMPINAN'] },
    // Admin & Pimpinan - audit
    { name: 'Riwayat Audit', icon: <History size={20} />, path: '/audit-logs', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    // Penyewa
    { name: 'Katalog Aset', icon: <Package size={20} />, path: '/catalog', roles: ['PENYEWA'] },
    { name: 'Pengajuan Saya', icon: <FileText size={20} />, path: '/my-rentals', roles: ['PENYEWA'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <div className="bg-blue-600 rounded-lg p-1.5 mr-3">
          <Package className="text-white" size={20} />
        </div>
        <span className="font-bold text-slate-800 text-lg">AssetSys</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
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
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 mr-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all lg:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-slate-800 lg:hidden hidden sm:block">AssetSys</h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-3 cursor-pointer p-1.5 sm:p-2 hover:bg-slate-50 rounded-lg transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.role || 'Role'}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
