import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  phone: z.string().regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka dan +').optional().or(z.literal('')),
  organization: z.string().optional().or(z.literal(''))
});

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      organization: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    
    try {
      const response = await api.post('/auth/register', { 
        ...data,
        roleCode: 'PENYEWA' // Default for registration
      });
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Daftar Akun</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bergabung sebagai Penyewa Aset Kampus
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input
                {...register('fullName')}
                type="text"
                className={`mt-1 block w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`mt-1 block w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`mt-1 block w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">No. Telepon</label>
                <input
                  {...register('phone')}
                  type="text"
                  className={`mt-1 block w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
                  placeholder="0812..."
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Organisasi</label>
                <input
                  {...register('organization')}
                  type="text"
                  className={`mt-1 block w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${errors.organization ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
                  placeholder="UKM / Instansi"
                />
                {errors.organization && <p className="mt-1 text-xs text-red-500">{errors.organization.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
            >
              {loading && <Loader2 className="animate-spin mr-2" size={20} />}
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
