import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ShoppingBag,
  Wallet,
  BarChart3,
  Users,
  CreditCard,
  ChevronDown,
  Settings,
  ShieldAlert
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef(null);

  // Close mobile menu & profile dropdown when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', roles: ['ADMIN_ASET', 'PIMPINAN', 'PENYEWA'] },
    // ====== Admin & Pimpinan ======
    { name: 'Order Center', icon: <ShoppingBag size={18} />, path: '/orders', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Manajemen Aset', icon: <Package size={18} />, path: '/assets', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Kelola Kategori', icon: <Package size={18} />, path: '/categories', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Aset Tambahan', icon: <Package size={18} />, path: '/additional-assets', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    
    // Modul baru
    { name: 'Beban Operasional', icon: <Wallet size={18} />, path: '/expenses', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Pagu Anggaran', icon: <BarChart3 size={18} />, path: '/budgets', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Revenue & Laporan', icon: <CreditCard size={18} />, path: '/revenue', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Kelola Pengguna', icon: <Users size={18} />, path: '/users', roles: ['PIMPINAN'] },

    { name: 'Persetujuan', icon: <FileText size={18} />, path: '/approvals', roles: ['PIMPINAN'] },
    { name: 'Verifikasi Pembayaran', icon: <FileText size={18} />, path: '/verify-payments', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    { name: 'Riwayat Audit', icon: <History size={18} />, path: '/audit-logs', roles: ['ADMIN_ASET', 'PIMPINAN'] },
    // ====== Penyewa ======
    { name: 'Katalog Aset', icon: <Package size={18} />, path: '/catalog', roles: ['PENYEWA'] },
    { name: 'Pengajuan Saya', icon: <FileText size={18} />, path: '/my-rentals', roles: ['PENYEWA'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-1.5 mr-3 shadow-md shadow-blue-100 flex items-center justify-center">
          <Package className="text-white" size={18} />
        </div>
        <span className="font-extrabold text-slate-800 text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AssetSys</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)} // Auto close on mobile click
            aria-current="page"
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200 outline-none
              focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              ${isActive 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 text-blue-600 font-bold shadow-sm shadow-blue-50/40' 
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'}
            `}
          >
            <span className={`mr-3.5 transition-colors duration-200 flex items-center justify-center`}>
              {item.icon}
            </span>
            <span className="text-sm tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Logout */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          aria-label="Logout dari aplikasi"
          className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          <LogOut size={18} className="mr-3.5 text-slate-400 group-hover:text-rose-500" />
          <span className="text-sm font-semibold tracking-wide">Keluar Sistem</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-50/50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay (With Smooth Transitions) */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col h-full
          transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Topbar / Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 sticky top-0 z-30 shadow-sm shadow-slate-100/40">
          <div className="flex items-center">
            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="p-2 -ml-2 mr-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-slate-600 transition-all duration-200 lg:hidden outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 lg:hidden hidden sm:block">AssetSys</h2>
          </div>

          {/* Right Side Icons & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            <button 
              aria-label="Notifikasi masuk"
              className="p-2.5 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-slate-600 relative transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

            {/* Profile Menu Dropdown Container */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                aria-label="Buka menu profil pengguna"
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-1.5 sm:p-2 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 select-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{user?.fullName || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-none">{user?.role || 'Role'}</p>
                </div>
                
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-100 border border-white">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={16} />}
                </div>

                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Component */}
              <div 
                className={`
                  absolute right-0 mt-2.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2
                  transform origin-top-right transition-all duration-200 ease-out
                  ${isProfileOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'}
                `}
              >
                <div className="px-4 py-2.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400 font-semibold leading-none">Masuk Sebagai</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/dashboard'); }}
                    className="flex items-center w-full px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 outline-none"
                  >
                    <LayoutDashboard size={14} className="mr-2 text-slate-400" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); }}
                    className="flex items-center w-full px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 outline-none"
                  >
                    <Settings size={14} className="mr-2 text-slate-400" />
                    Pengaturan Akun
                  </button>
                </div>

                <div className="border-t border-slate-50 p-1.5 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 outline-none"
                  >
                    <LogOut size={14} className="mr-2 text-rose-400" />
                    Keluar Sistem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport - INDEPENDENT SCROLL */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 focus:outline-none">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
