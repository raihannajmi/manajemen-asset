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
        },
        analytics: {
          revenueByMonth: [],
          topAssets: []
        }
      };
    }

    const totalAssets = await prisma.asset.count();
    const activeRentals = await prisma.rentalRequest.count({
      where: { status: 'ACTIVE_RENTAL' }
    });
    
    const revenue = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });

    const pendingApprovals = await prisma.rentalRequest.count({
      where: { status: 'PENDING_APPROVAL' }
    });

    const newSubmissions = await prisma.rentalRequest.count({
      where: { status: 'SUBMITTED' }
    });

    return {
      stats: {
        totalAssets,
        activeRentals,
        totalRevenue: revenue._sum.totalAmount || 0,
        pendingApprovals,
        newSubmissions
      }
    };
  }

  async getAnalytics() {
    // Last 6 months revenue
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(issue_date, 'Mon YYYY') as month,
        SUM(total_amount) as amount
      FROM invoices
      WHERE status = 'PAID' AND issue_date >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(issue_date, 'Mon YYYY'), DATE_TRUNC('month', issue_date)
      ORDER BY DATE_TRUNC('month', issue_date) ASC
    `;

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
      revenueByMonth,
      topAssets
    };
  }
}

module.exports = new DashboardService();
