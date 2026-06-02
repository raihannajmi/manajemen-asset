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
import Dashboard from './pages/Dashboard';
import AuditLogList from './pages/audit/AuditLogList';
import NotFound from './pages/NotFound';
import OrderCenter from './pages/orders/OrderCenter';
import ExpenseList from './pages/expenses/ExpenseList';
import BudgetManagement from './pages/budgets/BudgetManagement';
import RevenueOverview from './pages/revenue/RevenueOverview';
import UserManagement from './pages/users/UserManagement';


const queryClient = new QueryClient();

function App() {
  const { accessToken } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={!accessToken ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!accessToken ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={accessToken ? <DashboardLayout><Dashboard /></DashboardLayout> : <Navigate to="/login" />} />
          
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
          
          <Route path="/orders" element={accessToken ? <DashboardLayout><OrderCenter /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/verify-payments" element={accessToken ? <DashboardLayout><VerifyPayments /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/additional-assets" element={accessToken ? <DashboardLayout><AdditionalAssets /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/audit-logs" element={accessToken ? <DashboardLayout><AuditLogList /></DashboardLayout> : <Navigate to="/login" />} />

          {/* New Modules */}
          <Route path="/expenses" element={accessToken ? <DashboardLayout><ExpenseList /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/budgets" element={accessToken ? <DashboardLayout><BudgetManagement /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/revenue" element={accessToken ? <DashboardLayout><RevenueOverview /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/users" element={accessToken ? <DashboardLayout><UserManagement /></DashboardLayout> : <Navigate to="/login" />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
