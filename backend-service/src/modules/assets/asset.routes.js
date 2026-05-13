const express = require('express');
const router = express.Router();
const assetController = require('./asset.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

// Middleware for Admin only
const requireAdmin = [verifyToken, checkRole(['ADMIN_ASET', 'PIMPINAN'])];

// Categories
router.get('/categories', verifyToken, assetController.getCategories);
router.post('/categories', requireAdmin, assetController.createCategory);

// Assets
router.get('/', verifyToken, assetController.getAssets);
router.get('/:id', verifyToken, assetController.getAssetById);
router.post('/', requireAdmin, assetController.createAsset);
router.patch('/:id', requireAdmin, assetController.updateAsset);
router.delete('/:id', requireAdmin, assetController.deleteAsset);

// Availability
router.get('/:id/availability', verifyToken, assetController.checkAvailability);

// Media (Mocked Upload for now, waiting for AWS R2 integration)
router.post('/:id/media', requireAdmin, assetController.uploadMedia);

module.exports = router;
