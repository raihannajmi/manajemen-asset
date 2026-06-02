import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Search, 
  Filter, 
  User, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  X,
  AlertCircle
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal edit user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedRole, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/users', {
        params: {
          roleId: selectedRole || undefined,
          isActive: selectedStatus || undefined
        }
      });
      setUsers(usersRes.data);

      const rolesRes = await api.get('/users/roles');
      setRoles(rolesRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setRoleId(u.roleId);
    setIsActive(u.isActive);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser.id}`, {
        roleId: parseInt(roleId),
        isActive
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal merubah data pengguna.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan pengguna ini secara permanen?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menonaktifkan pengguna.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.organization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Pengguna</h1>
        <p className="text-slate-500 text-sm mt-1">Atur hak akses peran (role-based access control) dan status akun pengguna platform.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start space-x-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar Filter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, instansi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/75 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-500 text-sm font-medium">
            <Filter size={16} />
            <span>Filter:</span>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          >
            <option value="">Semua Peran</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100/75 border border-transparent rounded-xl text-sm transition-all focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <User size={48} className="text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 text-lg">Tidak Ada Pengguna</h3>
          <p className="text-slate-400 text-sm mt-1">Belum ada akun pengguna yang terdaftar pada kriteria pencarian ini.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-4 px-6">Identitas Pengguna</th>
                  <th className="py-4 px-6">Instansi / Unit</th>
                  <th className="py-4 px-6">Peran Akses</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.fullName}</p>
                          <p className="text-slate-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{u.organization || '-'}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        <Shield size={12} className="mr-1" /> {u.role?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <UserCheck size={12} className="mr-1" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          <UserX size={12} className="mr-1" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all"
                          title="Ubah Role/Status"
                        >
                          <Edit size={16} />
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-all"
                            title="Nonaktifkan User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Modifikasi Hak Akses</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="bg-blue-50/75 p-4 rounded-xl text-xs text-blue-700 space-y-1">
                <p className="font-bold text-blue-900">{selectedUser?.fullName}</p>
                <p>{selectedUser?.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Peran Akses (Role)</label>
                <select
                  required
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="text-slate-700 text-sm font-semibold select-none cursor-pointer">
                  Akun ini berstatus AKTIF
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
