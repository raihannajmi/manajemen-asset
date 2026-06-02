const express = require('express');
const router = express.Router();
const revenueController = require('./revenue.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// GET  /api/v1/revenue/external/summary
router.get('/external/summary', checkRole(['PIMPINAN', 'ADMIN_ASET']), revenueController.getSummary);

// GET  /api/v1/revenue/external
router.get('/external', checkRole(['ADMIN_ASET', 'PIMPINAN']), revenueController.getExternalRevenues);

// POST /api/v1/revenue/external
router.post('/external', checkRole(['ADMIN_ASET']), revenueController.createExternalRevenue);

// POST /api/v1/revenue/import
router.post('/import', checkRole(['ADMIN_ASET']), revenueController.importExternalRevenues);

module.exports = router;
