/**
 * budget.service.js
 * Service untuk Modul Pagu & Penyerapan Anggaran (Sprint 4)
 * Requirement: Modul 4 (Penyerapan Anggaran) & Modul 6 (Pagu Anggaran)
 */
const prisma = require('../../config/db');

class BudgetService {
  // ─── Unit Usaha ────────────────────────────────────────────────────────────

  async getUnitUsahaList() {
    return prisma.unitUsaha.findMany({ orderBy: { name: 'asc' } });
  }

  async createUnitUsaha(data) {
    return prisma.unitUsaha.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        picName: data.picName,
      },
    });
  }

  async updateUnitUsaha(id, data) {
    return prisma.unitUsaha.update({
      where: { id },
      data: { name: data.name, picName: data.picName },
    });
  }

  // ─── Pagu Anggaran ─────────────────────────────────────────────────────────

  async getBudgets({ fiscalYear, unitUsahaId } = {}) {
    const where = {};
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear);
    if (unitUsahaId) where.unitUsahaId = unitUsahaId;

    const budgets = await prisma.budgetLimit.findMany({
      where,
      include: {
        unitUsaha: true,
        absorptions: {
          select: { amountAbsorbed: true },
        },
      },
      orderBy: [{ fiscalYear: 'desc' }, { unitUsaha: { name: 'asc' } }],
    });

    // Hitung total serapan dan sisa pagu
    return budgets.map(b => {
      const absorbed = b.absorptions.reduce((sum, a) => sum + a.amountAbsorbed, 0);
      const remaining = b.allocatedQuota - absorbed;
      const absorptionRate = b.allocatedQuota > 0
        ? Math.round((absorbed / b.allocatedQuota) * 100)
        : 0;
      return {
        ...b,
        absorptions: undefined,
        totalAbsorbed: absorbed,
        remaining,
        absorptionRate,
      };
    });
  }

  async getBudgetById(id) {
    const budget = await prisma.budgetLimit.findUnique({
      where: { id },
      include: {
        unitUsaha: true,
        absorptions: {
          orderBy: { absorbedAt: 'desc' },
        },
      },
    });
    if (!budget) throw new Error('Pagu anggaran tidak ditemukan.');

    const absorbed = budget.absorptions.reduce((sum, a) => sum + a.amountAbsorbed, 0);
    return {
      ...budget,
      totalAbsorbed: absorbed,
      remaining: budget.allocatedQuota - absorbed,
      absorptionRate: budget.allocatedQuota > 0
        ? Math.round((absorbed / budget.allocatedQuota) * 100)
        : 0,
    };
  }

  async createBudget(data) {
    // Pastikan tidak duplikat unit+tahun
    const existing = await prisma.budgetLimit.findFirst({
      where: {
        unitUsahaId: data.unitUsahaId,
        fiscalYear: parseInt(data.fiscalYear),
      },
    });
    if (existing) {
      throw new Error(`Pagu untuk unit ini di tahun ${data.fiscalYear} sudah ada.`);
    }

    return prisma.budgetLimit.create({
      data: {
        unitUsahaId: data.unitUsahaId,
        allocatedQuota: parseFloat(data.allocatedQuota),
        fiscalYear: parseInt(data.fiscalYear),
      },
      include: { unitUsaha: true },
    });
  }

  async updateBudget(id, data) {
    await this.getBudgetById(id); // throws if not found
    return prisma.budgetLimit.update({
      where: { id },
      data: {
        allocatedQuota: data.allocatedQuota ? parseFloat(data.allocatedQuota) : undefined,
        fiscalYear: data.fiscalYear ? parseInt(data.fiscalYear) : undefined,
      },
      include: { unitUsaha: true },
    });
  }

  // ─── Penyerapan Anggaran ───────────────────────────────────────────────────

  async recordAbsorption(budgetId, data, userId) {
    return prisma.$transaction(async (tx) => {
      const budget = await tx.budgetLimit.findUnique({
        where: { id: budgetId },
      });
      if (!budget) throw new Error('Pagu anggaran tidak ditemukan.');

      // Hitung sisa pagu
      const aggResult = await tx.budgetAbsorption.aggregate({
        where: { budgetLimitId: budgetId },
        _sum: { amountAbsorbed: true },
      });
      const currentAbsorbed = aggResult._sum.amountAbsorbed || 0;
      const remaining = budget.allocatedQuota - currentAbsorbed;
      const newAmount = parseFloat(data.amount);

      if (newAmount > remaining) {
        throw new Error(
          `Jumlah penyerapan melebihi sisa pagu. Sisa tersedia: Rp ${remaining.toLocaleString('id-ID')}`
        );
      }

      return tx.budgetAbsorption.create({
        data: {
          budgetLimitId: budgetId,
          amountAbsorbed: newAmount,
          activityName: data.activityName,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          receiptUrl: data.receiptUrl,
          absorbedAt: new Date(data.absorbedAt || Date.now()),
          createdBy: userId,
        },
      });
    });
  }

  // ─── Ringkasan Anggaran ────────────────────────────────────────────────────

  async getSummary({ fiscalYear } = {}) {
    const year = parseInt(fiscalYear) || new Date().getFullYear();

    const budgets = await prisma.budgetLimit.findMany({
      where: { fiscalYear: year },
      include: {
        unitUsaha: true,
        absorptions: { select: { amountAbsorbed: true } },
      },
    });

    const items = budgets.map(b => {
      const absorbed = b.absorptions.reduce((sum, a) => sum + a.amountAbsorbed, 0);
      return {
        unitUsahaId: b.unitUsahaId,
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
}

module.exports = new BudgetService();
