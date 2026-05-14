import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/useAuthStore';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import AssetCategory from './pages/assets/AssetCategory';
import AssetManagement from './pages/assets/AssetManagement';
import AssetCatalog from './pages/catalog/AssetCatalog';
import AssetDetail from './pages/catalog/AssetDetail';
import MyRentals from './pages/rentals/MyRentals';
import BookAsset from './pages/rentals/BookAsset';
import VerifyRentals from './pages/approvals/VerifyRentals';
import ApproveRentals from './pages/approvals/ApproveRentals';
import RentalDetail from './pages/rentals/RentalDetail';
import VerifyPayments from './pages/approvals/VerifyPayments';
import AdditionalAssets from './pages/assets/AdditionalAssets';

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
          
          <Route path="/categories" element={accessToken ? <DashboardLayout><AssetCategory /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/assets" element={accessToken ? <DashboardLayout><AssetManagement /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/catalog" element={accessToken ? <DashboardLayout><AssetCatalog /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/catalog/:id" element={accessToken ? <DashboardLayout><AssetDetail /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/catalog/:id/book" element={accessToken ? <DashboardLayout><BookAsset /></DashboardLayout> : <Navigate to="/login" />} />
          
          <Route path="/my-rentals" element={accessToken ? <DashboardLayout><MyRentals /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/verify-rentals" element={accessToken ? <DashboardLayout><VerifyRentals /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/approvals" element={accessToken ? <DashboardLayout><ApproveRentals /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/rentals/:id" element={accessToken ? <DashboardLayout><RentalDetail /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/rentals/:id/edit" element={accessToken ? <DashboardLayout><BookAsset /></DashboardLayout> : <Navigate to="/login" />} />
          
          <Route path="/verify-payments" element={accessToken ? <DashboardLayout><VerifyPayments /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/additional-assets" element={accessToken ? <DashboardLayout><AdditionalAssets /></DashboardLayout> : <Navigate to="/login" />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
