/**
 * report.service.js
 * Service untuk Modul Laporan & Ekspor (Sprint 5)
 * Menyediakan pengolahan data keuangan (pendapatan konsolidasi, beban, pagu anggaran) dan okupansi
 */
const prisma = require('../../config/db');

class ReportService {
  async getRevenueReport({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // 1. Pendapatan Internal (Invoice PAID)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        issueDate: { gte: startDate, lte: endDate },
      },
      select: {
        totalAmount: true,
        issueDate: true,
      },
    });

    // 2. Pendapatan Eksternal (ExternalRevenue)
    const externalRevenues = await prisma.externalRevenue.findMany({
      where: {
        transactionDate: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        transactionDate: true,
        sourceUnit: true,
      },
    });

    // Inisialisasi 12 bulan
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('id-ID', { month: 'long' }),
      internal: 0,
      external: 0,
      total: 0,
    }));

    // Isi pendapatan internal
    for (const inv of paidInvoices) {
      const monthIndex = new Date(inv.issueDate).getMonth();
      monthlyData[monthIndex].internal += inv.totalAmount;
      monthlyData[monthIndex].total += inv.totalAmount;
    }

    // Isi pendapatan eksternal
    for (const rev of externalRevenues) {
      const monthIndex = new Date(rev.transactionDate).getMonth();
      monthlyData[monthIndex].external += rev.amount;
      monthlyData[monthIndex].total += rev.amount;
    }

    const totalInternal = monthlyData.reduce((sum, m) => sum + m.internal, 0);
    const totalExternal = monthlyData.reduce((sum, m) => sum + m.external, 0);
    const totalRevenue = totalInternal + totalExternal;

    return {
      fiscalYear: year,
      totalInternal,
      totalExternal,
      totalRevenue,
      monthlyData,
    };
  }

  async getExpensesReport({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const expenses = await prisma.operationalExpense.findMany({
      where: {
        periodDate: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    });

    const categories = await prisma.expenseCategory.findMany();
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const breakdown = {};
      categories.forEach(cat => {
        breakdown[cat.code] = 0;
      });
      return {
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('id-ID', { month: 'long' }),
        breakdown,
        total: 0,
      };
    });

    for (const exp of expenses) {
      const monthIndex = new Date(exp.periodDate).getMonth();
      const catCode = exp.category.code;
      if (monthlyData[monthIndex].breakdown[catCode] !== undefined) {
        monthlyData[monthIndex].breakdown[catCode] += exp.amount;
      } else {
        monthlyData[monthIndex].breakdown[catCode] = exp.amount;
      }
      monthlyData[monthIndex].total += exp.amount;
    }

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      fiscalYear: year,
      totalExpense,
      monthlyData,
    };
  }

  async getBudgetVsActualReport({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();

    const budgets = await prisma.budgetLimit.findMany({
      where: { fiscalYear: year },
      include: {
        unitUsaha: true,
        absorptions: {
          select: { amountAbsorbed: true },
        },
      },
    });

    const items = budgets.map(b => {
      const absorbed = b.absorptions.reduce((sum, a) => sum + a.amountAbsorbed, 0);
      return {
        unitUsahaCode: b.unitUsaha.code,
        unitUsahaName: b.unitUsaha.name,
        allocatedQuota: b.allocatedQuota,
        totalAbsorbed: absorbed,
        remaining: b.allocatedQuota - absorbed,
        absorptionRate: b.allocatedQuota > 0
          ? Math.round((absorbed / b.allocatedQuota) * 100)
          : 0,
      };
    });

    const totalAllocated = items.reduce((s, i) => s + i.allocatedQuota, 0);
    const totalAbsorbed = items.reduce((s, i) => s + i.totalAbsorbed, 0);

    return {
      fiscalYear: year,
      totalAllocated,
      totalAbsorbed,
      totalRemaining: totalAllocated - totalAbsorbed,
      overallRate: totalAllocated > 0
        ? Math.round((totalAbsorbed / totalAllocated) * 100)
        : 0,
      items,
    };
  }

  async getOccupancyReport({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();
    const totalAssets = await prisma.asset.count({
      where: { status: 'AVAILABLE' }, // Aset yang siap disewakan
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('id-ID', { month: 'long' }),
      rentedCount: 0,
      occupancyRate: 0,
    }));

    if (totalAssets === 0) {
      return { fiscalYear: year, totalAssets: 0, monthlyData };
    }

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Cari rental request yang overlap dengan bulan ini
      const activeRentals = await prisma.rentalRequest.findMany({
        where: {
          status: { in: ['ACTIVE_RENTAL', 'COMPLETED'] },
          startDatetime: { lte: endOfMonth },
          endDatetime: { gte: startOfMonth },
        },
        select: {
          assetId: true,
        },
      });

      // Hilangkan duplikasi aset tersewa pada bulan yang sama
      const uniqueAssetsRented = new Set(activeRentals.map(r => r.assetId));
      const rentedCount = uniqueAssetsRented.size;

      monthlyData[month].rentedCount = rentedCount;
      monthlyData[month].occupancyRate = Math.round((rentedCount / totalAssets) * 100);
    }

    const averageOccupancy = Math.round(
      monthlyData.reduce((sum, m) => sum + m.occupancyRate, 0) / 12
    );

    return {
      fiscalYear: year,
      totalAssets,
      averageOccupancy,
      monthlyData,
    };
  }

  // Utility konversi kolom & baris ke CSV string
  toCsv(columns, rows) {
    const escape = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [columns, ...rows].map(row => row.map(escape).join(',')).join('\n');
  }
}

module.exports = new ReportService();
