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
};

module.exports = { startRentalJobs };
