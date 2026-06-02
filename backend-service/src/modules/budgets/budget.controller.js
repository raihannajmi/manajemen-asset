const budgetService = require('./budget.service');
const { logAction } = require('../../shared/utils/auditLogger');

class BudgetController {
  // ─── Unit Usaha ─────────────────────────────────────────────────────────────
  async getUnitUsahaList(req, res) {
    try {
      const data = await budgetService.getUnitUsahaList();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createUnitUsaha(req, res) {
    try {
      const data = await budgetService.createUnitUsaha(req.body);
      await logAction({
        actorUserId: req.user.id, module: 'BUDGET', action: 'UNIT_USAHA_CREATED',
        entityType: 'UnitUsaha', entityId: data.id,
        afterJson: { code: data.code, name: data.name },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateUnitUsaha(req, res) {
    try {
      const data = await budgetService.updateUnitUsaha(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // ─── Pagu Anggaran ──────────────────────────────────────────────────────────
  async getBudgets(req, res) {
    try {
      const data = await budgetService.getBudgets(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBudgetById(req, res) {
    try {
      const data = await budgetService.getBudgetById(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createBudget(req, res) {
    try {
      const data = await budgetService.createBudget(req.body);
      await logAction({
        actorUserId: req.user.id, module: 'BUDGET', action: 'BUDGET_ALLOCATED',
        entityType: 'BudgetLimit', entityId: data.id,
        afterJson: { unitUsahaId: data.unitUsahaId, fiscalYear: data.fiscalYear, allocatedQuota: data.allocatedQuota },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateBudget(req, res) {
    try {
      const data = await budgetService.updateBudget(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async recordAbsorption(req, res) {
    try {
      const data = await budgetService.recordAbsorption(req.params.id, req.body, req.user.id);
      await logAction({
        actorUserId: req.user.id, module: 'BUDGET', action: 'ABSORPTION_RECORDED',
        entityType: 'BudgetAbsorption', entityId: data.id,
        afterJson: { budgetLimitId: req.params.id, amount: data.amountAbsorbed, activityName: data.activityName },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const data = await budgetService.getSummary(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BudgetController();
