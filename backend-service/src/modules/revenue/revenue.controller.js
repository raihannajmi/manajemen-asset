const revenueService = require('./revenue.service');
const { logAction } = require('../../shared/utils/auditLogger');

class RevenueController {
  async getExternalRevenues(req, res) {
    try {
      const data = await revenueService.getExternalRevenues(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createExternalRevenue(req, res) {
    try {
      const data = await revenueService.createExternalRevenue(req.body, req.user.id);
      await logAction({
        actorUserId: req.user.id,
        module: 'REVENUE',
        action: 'EXTERNAL_REVENUE_CREATED',
        entityType: 'ExternalRevenue',
        entityId: data.id,
        afterJson: { sourceUnit: data.sourceUnit, amount: data.amount, referenceNo: data.referenceNo },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async importExternalRevenues(req, res) {
    try {
      const data = await revenueService.importExternalRevenues(req.body.records, req.user.id);
      await logAction({
        actorUserId: req.user.id,
        module: 'REVENUE',
        action: 'EXTERNAL_REVENUE_IMPORTED',
        entityType: 'ExternalRevenue',
        entityId: 'BULK_IMPORT',
        afterJson: { count: data.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      res.status(201).json({ message: `${data.length} records successfully imported.`, count: data.length });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const data = await revenueService.getSummary(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RevenueController();
