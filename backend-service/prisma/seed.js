const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: 'PIMPINAN', name: 'Pimpinan / Direktur' },
    { code: 'ADMIN_ASET', name: 'Admin Manajemen Aset' },
    { code: 'PENYEWA', name: 'Penyewa / Tenant' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded successfully');

  // Fetch roles
  const pimpinanRole = await prisma.role.findUnique({ where: { code: 'PIMPINAN' } });
  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN_ASET' } });

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed Admin
  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'admin@kampus.ac.id' },
      update: {},
      create: {
        email: 'admin@kampus.ac.id',
        passwordHash,
        fullName: 'Admin Manajemen Aset',
        roleId: adminRole.id,
      }
    });
    console.log('Admin seeded: admin@kampus.ac.id / password123');
  }

  // Seed Pimpinan
  if (pimpinanRole) {
    await prisma.user.upsert({
      where: { email: 'pimpinan@kampus.ac.id' },
      update: {},
      create: {
        email: 'pimpinan@kampus.ac.id',
        passwordHash,
        fullName: 'Bapak Direktur',
        roleId: pimpinanRole.id,
      }
    });
    console.log('Pimpinan seeded: pimpinan@kampus.ac.id / password123');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
