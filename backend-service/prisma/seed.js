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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
