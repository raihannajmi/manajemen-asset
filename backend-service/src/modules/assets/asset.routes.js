const express = require('express');
const router = express.Router();
const assetController = require('./asset.controller');
const additionalAssetController = require('./additionalAsset.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

// Middleware for Admin only
const requireAdmin = [verifyToken, checkRole(['ADMIN_ASET', 'PIMPINAN'])];

// Additional Assets (Sprint 7)
router.get('/additional', verifyToken, additionalAssetController.getAll);
router.post('/additional/import', requireAdmin, additionalAssetController.importExcel);

// Categories
router.get('/categories', verifyToken, assetController.getCategories);
router.post('/categories', requireAdmin, assetController.createCategory);

const validateRequest = require('../../middleware/validateRequest');
const { createAssetSchema, updateAssetSchema } = require('../../shared/validators/asset.validation');

// Assets
router.get('/', verifyToken, assetController.getAssets);
router.get('/:id', verifyToken, assetController.getAssetById);
router.post('/', requireAdmin, validateRequest(createAssetSchema), assetController.createAsset);
router.patch('/:id', requireAdmin, validateRequest(updateAssetSchema), assetController.updateAsset);
router.delete('/:id', requireAdmin, assetController.deleteAsset);

// Availability
router.get('/:id/availability', verifyToken, assetController.checkAvailability);

// Price Estimate
router.get('/:id/price-estimate', verifyToken, assetController.getPriceEstimate);

// Media (Mocked Upload for now, waiting for AWS R2 integration)
router.post('/:id/media', requireAdmin, assetController.uploadMedia);

module.exports = router;
