/**
 * revenue.service.js
 * Service untuk Modul Revenue Eksternal (Sprint 5)
 * Menyediakan pencatatan revenue dari unit usaha luar (UNNES Press, PUSLAKES, Asrama, dll)
 */
const prisma = require('../../config/db');

class RevenueService {
  async getExternalRevenues({ sourceUnit, startDate, endDate } = {}) {
    const where = {};
    if (sourceUnit) where.sourceUnit = sourceUnit;
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    return prisma.externalRevenue.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
    });
  }

  async createExternalRevenue(data, userId) {
    return prisma.externalRevenue.create({
      data: {
        sourceUnit: data.sourceUnit.toUpperCase(),
        amount: parseFloat(data.amount),
        transactionDate: new Date(data.transactionDate),
        referenceNo: data.referenceNo,
        description: data.description,
        importedBy: userId,
      },
    });
  }

  async importExternalRevenues(records, userId) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Data import tidak valid atau kosong.');
    }

    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const record of records) {
        // Validasi input minimal
        if (!record.sourceUnit || !record.amount || !record.transactionDate || !record.referenceNo) {
          throw new Error(`Data tidak lengkap pada baris: ${JSON.stringify(record)}`);
        }

        // Cek duplikasi referenceNo
        const existing = await tx.externalRevenue.findUnique({
          where: { referenceNo: record.referenceNo },
        });

        if (existing) {
          throw new Error(`Nomor referensi ${record.referenceNo} sudah terdaftar sebelumnya.`);
        }

        const created = await tx.externalRevenue.create({
          data: {
            sourceUnit: record.sourceUnit.toUpperCase(),
            amount: parseFloat(record.amount),
            transactionDate: new Date(record.transactionDate),
            referenceNo: record.referenceNo,
            description: record.description || null,
            importedBy: userId,
          },
        });
        results.push(created);
      }
      return results;
    });
  }

  async getSummary({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const revenues = await prisma.externalRevenue.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Kelompokkan per sourceUnit
    const summaryMap = {};
    for (const rev of revenues) {
      if (!summaryMap[rev.sourceUnit]) {
        summaryMap[rev.sourceUnit] = 0;
      }
      summaryMap[rev.sourceUnit] += rev.amount;
    }

    const items = Object.entries(summaryMap).map(([unit, total]) => ({
      sourceUnit: unit,
      totalAmount: total,
    }));

    const totalRevenue = items.reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      fiscalYear: year,
      totalRevenue,
      items,
    };
  }
}

module.exports = new RevenueService();
