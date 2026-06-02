const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// GET /api/v1/reports/revenue
router.get('/revenue', checkRole(['PIMPINAN', 'ADMIN_ASET']), reportController.getRevenueReport);

// GET /api/v1/reports/expenses
router.get('/expenses', checkRole(['PIMPINAN', 'ADMIN_ASET']), reportController.getExpensesReport);

// GET /api/v1/reports/budget-vs-actual
router.get('/budget-vs-actual', checkRole(['PIMPINAN', 'ADMIN_ASET']), reportController.getBudgetVsActualReport);

// GET /api/v1/reports/occupancy
router.get('/occupancy', checkRole(['PIMPINAN', 'ADMIN_ASET']), reportController.getOccupancyReport);

// GET /api/v1/reports/export
router.get('/export', checkRole(['PIMPINAN', 'ADMIN_ASET']), reportController.exportReport);

module.exports = router;
