const prisma = require('../../config/db');

class DashboardService {
  async getSummary(user) {
    if (user.role === 'PENYEWA') {
      const myRentals = await prisma.rentalRequest.count({
        where: { tenantUserId: user.id }
      });
      const activeRentals = await prisma.rentalRequest.count({
        where: { tenantUserId: user.id, status: 'ACTIVE_RENTAL' }
      });
      const pendingRentals = await prisma.rentalRequest.count({
        where: { tenantUserId: user.id, status: 'SUBMITTED' }
      });

      return {
        stats: {
          myRentals,
          activeRentals,
          pendingRentals,
          totalAssets: await prisma.asset.count()
        }
      };
    }

    const totalAssets = await prisma.asset.count();
    
    // Active rented assets right now
    const today = new Date();
    const currentlyRented = await prisma.rentalRequest.findMany({
      where: {
        status: 'ACTIVE_RENTAL',
        startDatetime: { lte: today },
        endDatetime: { gte: today }
      },
      select: { assetId: true }
    });
    
    const rentedAssetIds = new Set(currentlyRented.map(r => r.assetId));
    const rentedAssets = rentedAssetIds.size;
    const availableAssets = totalAssets - rentedAssets;
    
    const revenue = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });

    return {
      stats: {
        totalAssets,
        rentedAssets,
        availableAssets,
        totalRevenue: revenue._sum.totalAmount || 0,
      }
    };
  }

  async getAnalytics(period = 'MONTHLY') {
    let revenueData = [];
    const now = new Date();

    if (period === 'DAILY') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      revenueData = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(issue_date, 'DD Mon') as period,
          SUM(total_amount) as amount
        FROM invoices
        WHERE status = 'PAID' AND issue_date >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR(issue_date, 'DD Mon'), DATE_TRUNC('day', issue_date)
        ORDER BY DATE_TRUNC('day', issue_date) ASC
      `;
    } else if (period === 'MONTHLY') {
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      revenueData = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(issue_date, 'Mon YYYY') as period,
          SUM(total_amount) as amount
        FROM invoices
        WHERE status = 'PAID' AND issue_date >= ${twelveMonthsAgo}
        GROUP BY TO_CHAR(issue_date, 'Mon YYYY'), DATE_TRUNC('month', issue_date)
        ORDER BY DATE_TRUNC('month', issue_date) ASC
      `;
    } else if (period === 'YEARLY') {
      const fiveYearsAgo = new Date(now);
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      revenueData = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(issue_date, 'YYYY') as period,
          SUM(total_amount) as amount
        FROM invoices
        WHERE status = 'PAID' AND issue_date >= ${fiveYearsAgo}
        GROUP BY TO_CHAR(issue_date, 'YYYY'), DATE_TRUNC('year', issue_date)
        ORDER BY DATE_TRUNC('year', issue_date) ASC
      `;
    }

    // Convert BigInt to Number if necessary (Prisma queryRaw sometimes returns BigInt for sums)
    revenueData = revenueData.map(item => ({
      period: item.period,
      amount: Number(item.amount || 0)
    }));

    // Utilization: count rentals by asset
    const assetUtilization = await prisma.rentalRequest.groupBy({
      by: ['assetId'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          assetId: 'desc'
        }
      },
      take: 5
    });

    // Get asset names for utilization
    const topAssets = await Promise.all(
      assetUtilization.map(async (item) => {
        const asset = await prisma.asset.findUnique({
          where: { id: item.assetId },
          select: { name: true }
        });
        return {
          name: asset.name,
          count: item._count._all
        };
      })
    );

    return {
      revenueData,
      topAssets
    };
  }
}

module.exports = new DashboardService();
