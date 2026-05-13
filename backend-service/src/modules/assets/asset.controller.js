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

  // Upload Media Placeholder
  async uploadMedia(req, res) {
    try {
      // In a real implementation, multer-s3 handles the upload to Cloudflare R2
      // and places the URL in req.file.location
      const fileUrl = req.file ? req.file.location : 'https://placeholder.url/image.png';
      
      const { prisma } = require('../../config/db');
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
}

module.exports = new AssetController();
