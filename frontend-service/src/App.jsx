import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/useAuthStore';

// Temporary components
const LoginPage = () => <div className="flex items-center justify-center h-screen text-2xl">Login Page (Pending)</div>;
const RegisterPage = () => <div className="flex items-center justify-center h-screen text-2xl">Register Page (Pending)</div>;
const DashboardPage = () => <div className="flex items-center justify-center h-screen text-2xl">Dashboard Page (Pending)</div>;

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
