const rentalService = require('./rental.service');

class RentalController {
  async getRentals(req, res) {
    try {
      // If tenant, only get their own. If admin/pimpinan, can filter or see all.
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
      
      // Security check
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
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateDraft(req, res) {
    try {
      const data = await rentalService.updateDraft(req.params.id, req.user.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async uploadDocument(req, res) {
    try {
      // Mock upload for now
      const fileUrl = req.file ? req.file.location : 'https://placeholder.url/doc.pdf';
      const data = await rentalService.uploadDocument(req.params.id, {
        docType: req.body.docType,
        fileUrl
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async submitRequest(req, res) {
    try {
      const data = await rentalService.submitRequest(req.params.id, req.user.id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyRequest(req, res) {
    try {
      const data = await rentalService.verifyRequest(req.params.id, req.user.id, req.body.note);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async approveRequest(req, res) {
    try {
      const { action, note } = req.body;
      const data = await rentalService.approveRequest(req.params.id, req.user.id, action, note);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new RentalController();
