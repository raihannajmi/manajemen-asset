const billingService = require('./billing.service');

class BillingController {
  async generateInvoice(req, res) {
    try {
      const data = await billingService.generateInvoice(req.params.id, req.user.id, req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const data = await billingService.getInvoiceById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Invoice not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadPaymentProof(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { getPublicUrl } = require('../../shared/utils/s3Uploader');
      const proofUrl = getPublicUrl(req.file.key);

      const data = await billingService.uploadPaymentProof(req.params.id, req.user.id, {
        amount: req.body.amount,
        transferDate: req.body.transferDate,
        proofUrl
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyPayment(req, res) {
    try {
      const { status, note } = req.body;
      const data = await billingService.verifyPayment(req.params.id, req.user.id, { status, note });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async generateContract(req, res) {
    try {
      const data = await billingService.generateContract(req.params.id, req.user.id);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new BillingController();
