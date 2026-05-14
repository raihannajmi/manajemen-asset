const assetService = require('./asset.service');

class AssetController {
  // Categories
  async getCategories(req, res) {
    try {
      const data = await assetService.getCategories();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const data = await assetService.createCategory(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Assets
  async getAssets(req, res) {
    try {
      const data = await assetService.getAssets(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAssetById(req, res) {
    try {
      const data = await assetService.getAssetById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Asset not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createAsset(req, res) {
    try {
      const data = await assetService.createAsset(req.body);
      res.status(201).json(data);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Kode Aset sudah digunakan, silakan gunakan kode lain.' });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async updateAsset(req, res) {
    try {
      const data = await assetService.updateAsset(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteAsset(req, res) {
    try {
      await assetService.deleteAsset(req.params.id);
      res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Availability
  async checkAvailability(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const data = await assetService.getAvailability(req.params.id, startDate, endDate);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Media Upload (R2 Integrated)
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { getPublicUrl } = require('../../shared/utils/s3Uploader');
      const fileUrl = getPublicUrl(req.file.key);
      
      const prisma = require('../../config/db');
      const media = await prisma.assetMedia.create({
        data: {
          assetId: req.params.id,
          mediaType: req.body.mediaType || 'IMAGE',
          fileUrl: fileUrl,
        }
      });
      res.status(201).json(media);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getPriceEstimate(req, res) {
    try {
      const { id } = req.params;
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ message: 'Parameter start dan end wajib diisi (format ISO datetime)' });
      }

      const prisma = require('../../config/db');
      const asset = await prisma.asset.findUnique({
        where: { id },
        select: { pricingSchemeJson: true }
      });

      if (!asset) {
        return res.status(404).json({ message: 'Aset tidak ditemukan' });
      }

      const { calculatePrice } = require('../../shared/utils/pricingEngine');
      try {
        const estimate = calculatePrice(start, end, asset.pricingSchemeJson);
        res.status(200).json(estimate || { message: 'Skema harga tidak tersedia untuk aset ini' });
      } catch (calcError) {
         res.status(400).json({ message: calcError.message });
      }

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getRentalHistory(req, res) {
    try {
      const { id } = req.params;
      const prisma = require('../../config/db');
      const history = await prisma.rentalRequest.findMany({
        where: { assetId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          tenantUser: {
            select: { fullName: true, email: true, organization: true }
          },
          invoice: { select: { totalAmount: true, status: true } }
        }
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const prisma = require('../../config/db');
      await prisma.assetMedia.delete({ where: { id: mediaId } });
      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AssetController();
