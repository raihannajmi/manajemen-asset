const additionalAssetService = require('./additionalAsset.service');

class AdditionalAssetController {
  async getAll(req, res) {
    try {
      const data = await additionalAssetService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async importExcel(req, res) {
    try {
      // In a real application, we would use a library like `xlsx` to parse `req.file.buffer`.
      // Since file parsing requires external libraries and specific Excel formats, 
      // we assume `req.body.data` contains the parsed JSON array for this implementation.
      const parsedData = req.body.data;
      
      const result = await additionalAssetService.importData(parsedData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AdditionalAssetController();
