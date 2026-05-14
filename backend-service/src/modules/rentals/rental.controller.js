const rentalService = require('./rental.service');
const { logAction } = require('../../shared/utils/auditLogger');

class RentalController {
  async getRentals(req, res) {
    try {
      const filters = { ...req.query };
      if (req.user.role === 'PENYEWA') {
        filters.tenantUserId = req.user.id;
      }
      const data = await rentalService.getRentals(filters);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRentalById(req, res) {
    try {
      const data = await rentalService.getRentalById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Rental request not found' });
      if (req.user.role === 'PENYEWA' && data.tenantUserId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createDraft(req, res) {
    try {
      const data = await rentalService.createDraft(req.user.id, req.body);
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: 'CREATE_DRAFT',
        entityType: 'RentalRequest', entityId: data.id,
        afterJson: { requestNo: data.requestNo, assetId: data.assetId, status: data.status },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateDraft(req, res) {
    try {
      const before = await rentalService.getRentalById(req.params.id);
      const data = await rentalService.updateDraft(req.params.id, req.user.id, req.body);
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: 'UPDATE_DRAFT',
        entityType: 'RentalRequest', entityId: data.id,
        beforeJson: { eventName: before?.eventName, startDatetime: before?.startDatetime },
        afterJson: { eventName: data.eventName, startDatetime: data.startDatetime },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const { getPublicUrl } = require('../../shared/utils/s3Uploader');
      const fileUrl = getPublicUrl(req.file.key);
      const data = await rentalService.uploadDocument(req.params.id, {
        docType: req.body.docType,
        fileUrl
      });
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: 'UPLOAD_DOCUMENT',
        entityType: 'RentalRequest', entityId: req.params.id,
        afterJson: { docType: req.body.docType, fileUrl },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async submitRequest(req, res) {
    try {
      const data = await rentalService.submitRequest(req.params.id, req.user.id);
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: 'SUBMIT',
        entityType: 'RentalRequest', entityId: data.id,
        beforeJson: { status: 'DRAFT' },
        afterJson: { status: 'SUBMITTED', requestNo: data.requestNo },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyRequest(req, res) {
    try {
      const data = await rentalService.verifyRequest(req.params.id, req.user.id, req.body.note);
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: 'VERIFY',
        entityType: 'RentalRequest', entityId: data.id,
        beforeJson: { status: 'SUBMITTED' },
        afterJson: { status: 'PENDING_APPROVAL', note: req.body.note },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async approveRequest(req, res) {
    try {
      const { action, note } = req.body;
      const data = await rentalService.approveRequest(req.params.id, req.user.id, action, note);
      await logAction({
        actorUserId: req.user.id, module: 'RENTAL', action: action, // APPROVED / REJECTED / REVISION
        entityType: 'RentalRequest', entityId: data.id,
        beforeJson: { status: 'PENDING_APPROVAL' },
        afterJson: { status: data.status, note },
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new RentalController();
