const prisma = require('../../config/db');

class AssetService {
  // --- CATEGORIES ---
  async getCategories() {
    return prisma.assetCategory.findMany();
  }

  async createCategory(data) {
    const { id, ...cleanData } = data;
    return prisma.assetCategory.create({ data: cleanData });
  }

  async updateCategory(id, data) {
    return prisma.assetCategory.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async deleteCategory(id) {
    return prisma.assetCategory.delete({
      where: { id: parseInt(id) },
    });
  }

  async clearAssetsCache() {
    const redis = require('../../config/redis');
    const keys = await redis.keys('assets:list:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  // --- ASSETS ---
  async getAssets(filters = {}) {
    const redis = require('../../config/redis');
    const cacheKey = `assets:list:${JSON.stringify(filters)}`;

    // Try to get from Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const where = {};
    if (filters.categoryId) where.categoryId = parseInt(filters.categoryId);
    if (filters.status) where.availabilityStatus = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { assetCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        media: true,
      },
    });

    // Save to Cache (expire in 1 hour)
    await redis.set(cacheKey, JSON.stringify(assets), 'EX', 3600);

    return assets;
  }

  async getAssetById(id) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        media: true,
        availability: true,
      },
    });
  }

  async createAsset(data) {
    const { id, ...cleanData } = data;
    const asset = await prisma.asset.create({ data: cleanData });
    await this.clearAssetsCache();
    return asset;
  }

  async updateAsset(id, data) {
    const asset = await prisma.asset.update({
      where: { id },
      data,
    });
    await this.clearAssetsCache();
    return asset;
  }

  async deleteAsset(id) {
    const result = await prisma.asset.delete({ where: { id } });
    await this.clearAssetsCache();
    return result;
  }

  // --- AVAILABILITY ---
  async getAvailability(assetId, startDate, endDate) {
    return prisma.assetAvailability.findMany({
      where: {
        assetId,
        startDate: { gte: new Date(startDate) },
        endDate: { lte: new Date(endDate) },
      },
    });
  }
}

module.exports = new AssetService();
