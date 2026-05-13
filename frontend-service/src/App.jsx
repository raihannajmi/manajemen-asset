import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/useAuthStore';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';

// Temporary components
const DashboardPage = () => (
  <DashboardLayout>
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800">Ringkasan Dashboard</h1>
      <p className="text-slate-600 mt-2">Selamat datang di Sistem Manajemen Aset Kampus. Gunakan menu di samping untuk mengelola aset atau pengajuan Anda.</p>
    </div>
  </DashboardLayout>
);

const queryClient = new QueryClient();

function App() {
  const { accessToken } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={!accessToken ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!accessToken ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={accessToken ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
