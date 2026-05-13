const prisma = require('../../config/db');

class AdditionalAssetService {
  async getAll() {
    return prisma.additionalAsset.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async importData(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('Data import kosong atau format salah.');
    }

    let successCount = 0;
    let errors = [];

    for (let i = 0; i < dataArray.length; i++) {
      const row = dataArray[i];
      try {
        if (!row.assetCode || !row.name || !row.category || !row.price) {
          throw new Error('Kolom wajib (assetCode, name, category, price) harus diisi.');
        }

        await prisma.additionalAsset.upsert({
          where: { assetCode: row.assetCode.toString() },
          update: {
            name: row.name,
            category: row.category,
            price: parseFloat(row.price),
            stock: parseInt(row.stock || 1),
            description: row.description || null
          },
          create: {
            assetCode: row.assetCode.toString(),
            name: row.name,
            category: row.category,
            price: parseFloat(row.price),
            stock: parseInt(row.stock || 1),
            description: row.description || null
          }
        });
        successCount++;
      } catch (err) {
        errors.push(`Baris ${i + 1} (${row.assetCode || 'N/A'}): ${err.message}`);
      }
    }

    return {
      message: `Import selesai. Berhasil: ${successCount}, Gagal: ${errors.length}`,
      errors
    };
  }
}

module.exports = new AdditionalAssetService();
