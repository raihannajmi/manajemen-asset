const cron = require('node-cron');
const prisma = require('../config/db');

// Run every day at 00:01
const startRentalJobs = () => {
  cron.schedule('1 0 * * *', async () => {
    console.log('[CRON] Running daily job to complete expired rentals...');
    try {
      const now = new Date();
      const expiredRentals = await prisma.rentalRequest.findMany({
        where: {
          status: 'ACTIVE_RENTAL',
          endDatetime: { lt: now }
        }
      });

      if (expiredRentals.length > 0) {
        const ids = expiredRentals.map(r => r.id);
        
        await prisma.rentalRequest.updateMany({
          where: { id: { in: ids } },
          data: { status: 'COMPLETED' }
        });

        // Add to status history
        const historyData = ids.map(id => ({
          requestId: id,
          fromStatus: 'ACTIVE_RENTAL',
          toStatus: 'COMPLETED',
          changedBy: 'SYSTEM_CRON',
          note: 'Masa sewa telah berakhir, status diubah menjadi COMPLETED secara otomatis.'
        }));

        await prisma.statusHistory.createMany({
          data: historyData
        });

        console.log(`[CRON] Successfully completed ${expiredRentals.length} rentals.`);
      } else {
        console.log('[CRON] No expired rentals found today.');
      }
    } catch (error) {
      console.error('[CRON] Error updating expired rentals:', error);
    }
  });

  // Run every day at 00:05 — Notifikasi H-7 dan H-1 jatuh tempo kontrak
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Checking upcoming lease expirations (H-7, H-1)...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const daysAhead of [7, 1]) {
        const targetStart = new Date(today);
        targetStart.setDate(targetStart.getDate() + daysAhead);
        const targetEnd = new Date(targetStart);
        targetEnd.setHours(23, 59, 59, 999);

        const expiringRentals = await prisma.rentalRequest.findMany({
          where: {
            status: 'ACTIVE_RENTAL',
            endDatetime: { gte: targetStart, lte: targetEnd }
          },
          include: {
            asset: { select: { name: true } },
            tenantUser: { select: { fullName: true, email: true } }
          }
        });

        if (expiringRentals.length > 0) {
          // Persist ke audit log sebagai notifikasi sementara
          const notifData = expiringRentals.map(r => ({
            actorUserId: null,
            module: 'NOTIFICATION',
            action: `CONTRACT_EXPIRY_H${daysAhead}`,
            entityType: 'RentalRequest',
            entityId: r.id,
            afterJson: {
              message: `Sewa aset "${r.asset.name}" oleh ${r.tenantUser.fullName} akan berakhir dalam ${daysAhead} hari (${r.endDatetime.toLocaleDateString('id-ID')}).`,
              tenantEmail: r.tenantUser.email,
            },
          }));
          await prisma.auditLog.createMany({ data: notifData });

          console.log(`[CRON] H-${daysAhead}: Notified ${expiringRentals.length} expiring rental(s).`);
        }
      }
    } catch (error) {
      console.error('[CRON] Error checking lease expirations:', error);
    }
  });
};

module.exports = { startRentalJobs };
