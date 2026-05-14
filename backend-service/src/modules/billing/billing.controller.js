const billingService = require('./billing.service');
const { logAction } = require('../../shared/utils/auditLogger');

class BillingController {
  async generateInvoice(req, res) {
    try {
      const data = await billingService.generateInvoice(req.params.id, req.user.id, req.body);
      await logAction({
        actorUserId: req.user.id, module: 'BILLING', action: 'INVOICE_GENERATED',
        entityType: 'Invoice', entityId: data.id,
        afterJson: { invoiceNo: data.invoiceNo, totalAmount: data.totalAmount, requestId: data.requestId },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
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
      await logAction({
        actorUserId: req.user.id, module: 'BILLING', action: 'PAYMENT_SUBMITTED',
        entityType: 'Payment', entityId: data.id,
        afterJson: { invoiceId: req.params.id, amount: req.body.amount, proofUrl },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
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
      await logAction({
        actorUserId: req.user.id, module: 'BILLING', action: status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        entityType: 'Payment', entityId: req.params.id,
        afterJson: { status, note, verifiedBy: req.user.id },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async generateContract(req, res) {
    try {
      const data = await billingService.generateContract(req.params.id, req.user.id);
      await logAction({
        actorUserId: req.user.id, module: 'BILLING', action: 'CONTRACT_ISSUED',
        entityType: 'Contract', entityId: data.id,
        afterJson: { contractNo: data.contractNo, requestId: data.requestId },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new BillingController();
