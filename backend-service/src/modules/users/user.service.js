/**
 * user.service.js
 * Service untuk Modul Kelola Pengguna (Sprint 6)
 * Menyediakan CRUD pengguna dan manajemen hak akses (role)
 */
const prisma = require('../../config/db');

class UserService {
  async getUsers({ roleId, isActive } = {}) {
    const where = {};
    if (roleId) where.roleId = parseInt(roleId);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        organization: true,
        isActive: true,
        roleId: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        organization: true,
        isActive: true,
        roleId: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) throw new Error('Pengguna tidak ditemukan.');
    return user;
  }

  async updateUser(id, data) {
    // Validasi email unik jika berubah
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (existing) throw new Error('Email sudah digunakan oleh pengguna lain.');
    }

    return prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        roleId: data.roleId ? parseInt(data.roleId) : undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        organization: true,
        isActive: true,
        roleId: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteUser(id) {
    // Soft-delete: nonaktifkan akun
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, fullName: true, isActive: true },
    });
  }

  async getRoles() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

module.exports = new UserService();
