const expenseService = require('./expense.service');
const { logAction } = require('../../shared/utils/auditLogger');

class ExpenseController {
  async getCategories(req, res) {
    try {
      const data = await expenseService.getCategories();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const data = await expenseService.createCategory(req.body);
      await logAction({
        actorUserId: req.user.id, module: 'EXPENSE', action: 'CATEGORY_CREATED',
        entityType: 'ExpenseCategory', entityId: String(data.id),
        afterJson: { code: data.code, name: data.name },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getExpenses(req, res) {
    try {
      const data = await expenseService.getExpenses(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getExpenseById(req, res) {
    try {
      const data = await expenseService.getExpenseById(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createExpense(req, res) {
    try {
      const data = await expenseService.createExpense(req.body, req.user.id);
      await logAction({
        actorUserId: req.user.id, module: 'EXPENSE', action: 'EXPENSE_CREATED',
        entityType: 'OperationalExpense', entityId: data.id,
        afterJson: { categoryId: data.categoryId, amount: data.amount, periodDate: data.periodDate },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateExpense(req, res) {
    try {
      const data = await expenseService.updateExpense(req.params.id, req.body);
      await logAction({
        actorUserId: req.user.id, module: 'EXPENSE', action: 'EXPENSE_UPDATED',
        entityType: 'OperationalExpense', entityId: data.id,
        afterJson: req.body,
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteExpense(req, res) {
    try {
      await expenseService.deleteExpense(req.params.id);
      await logAction({
        actorUserId: req.user.id, module: 'EXPENSE', action: 'EXPENSE_DELETED',
        entityType: 'OperationalExpense', entityId: req.params.id,
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json({ message: 'Beban operasional berhasil dihapus.' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const data = await expenseService.getSummary(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ExpenseController();
