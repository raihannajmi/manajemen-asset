/**
 * expense.service.js
 * Service untuk Modul Beban Operasional (Sprint 3)
 * Requirement: Modul 7 — Beban Operasional (Listrik, Air, Internet)
 */
const prisma = require('../../config/db');

class ExpenseService {
  // ─── Kategori ─────────────────────────────────────────────────────────────

  async getCategories() {
    return prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(data) {
    return prisma.expenseCategory.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
      },
    });
  }

  // ─── Beban Operasional ────────────────────────────────────────────────────

  async getExpenses({ categoryId, startDate, endDate, page = 1, limit = 20 } = {}) {
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (startDate || endDate) {
      where.periodDate = {};
      if (startDate) where.periodDate.gte = new Date(startDate);
      if (endDate) where.periodDate.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.operationalExpense.findMany({
        where,
        include: { category: true },
        orderBy: { periodDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.operationalExpense.count({ where }),
    ]);

    return { data, total, page: parseInt(page), limit: parseInt(limit) };
  }

  async getExpenseById(id) {
    const expense = await prisma.operationalExpense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expense) throw new Error('Beban operasional tidak ditemukan.');
    return expense;
  }

  async createExpense(data, userId) {
    // Pastikan kategori ada
    const category = await prisma.expenseCategory.findUnique({
      where: { id: parseInt(data.categoryId) },
    });
    if (!category) throw new Error('Kategori beban tidak ditemukan.');

    return prisma.operationalExpense.create({
      data: {
        categoryId: parseInt(data.categoryId),
        amount: parseFloat(data.amount),
        periodDate: new Date(data.periodDate),
        description: data.description,
        receiptUrl: data.receiptUrl,
        createdBy: userId,
      },
      include: { category: true },
    });
  }

  async updateExpense(id, data) {
    await this.getExpenseById(id); // throws if not found
    return prisma.operationalExpense.update({
      where: { id },
      data: {
        categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        periodDate: data.periodDate ? new Date(data.periodDate) : undefined,
        description: data.description,
        receiptUrl: data.receiptUrl,
      },
      include: { category: true },
    });
  }

  async deleteExpense(id) {
    await this.getExpenseById(id); // throws if not found
    return prisma.operationalExpense.delete({ where: { id } });
  }

  // ─── Ringkasan ────────────────────────────────────────────────────────────

  async getSummary({ year } = {}) {
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // Total per kategori tahun ini
    const byCategory = await prisma.$queryRaw`
      SELECT
        ec.code,
        ec.name,
        COALESCE(SUM(oe.amount), 0) as total
      FROM expense_categories ec
      LEFT JOIN operational_expenses oe
        ON oe.category_id = ec.id
        AND oe.period_date >= ${startOfYear}
        AND oe.period_date <= ${endOfYear}
      GROUP BY ec.id, ec.code, ec.name
      ORDER BY total DESC
    `;

    // Total bulanan tahun ini
    const monthly = await prisma.$queryRaw`
      SELECT
        TO_CHAR(period_date, 'Mon YYYY') as period,
        DATE_TRUNC('month', period_date) as month_date,
        SUM(amount) as total
      FROM operational_expenses
      WHERE period_date >= ${startOfYear} AND period_date <= ${endOfYear}
      GROUP BY period, month_date
      ORDER BY month_date ASC
    `;

    const grandTotal = await prisma.operationalExpense.aggregate({
      where: { periodDate: { gte: startOfYear, lte: endOfYear } },
      _sum: { amount: true },
    });

    return {
      year: currentYear,
      grandTotal: Number(grandTotal._sum.amount || 0),
      byCategory: byCategory.map(r => ({ ...r, total: Number(r.total) })),
      monthly: monthly.map(r => ({
        period: r.period,
        total: Number(r.total),
      })),
    };
  }
}

module.exports = new ExpenseService();
