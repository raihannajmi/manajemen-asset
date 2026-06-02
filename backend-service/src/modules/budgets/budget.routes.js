const express = require('express');
const router = express.Router();
const budgetController = require('./budget.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// ─── Unit Usaha ─────────────────────────────────────────────────────────────
// GET  /api/v1/budgets/unit-usaha
router.get('/unit-usaha', budgetController.getUnitUsahaList);
// POST /api/v1/budgets/unit-usaha
router.post('/unit-usaha', checkRole(['PIMPINAN']), budgetController.createUnitUsaha);
// PUT  /api/v1/budgets/unit-usaha/:id
router.put('/unit-usaha/:id', checkRole(['PIMPINAN']), budgetController.updateUnitUsaha);

// ─── Pagu & Penyerapan Anggaran ──────────────────────────────────────────────
// GET  /api/v1/budgets/summary
router.get('/summary', checkRole(['PIMPINAN', 'ADMIN_ASET']), budgetController.getSummary);
// GET  /api/v1/budgets
router.get('/', checkRole(['ADMIN_ASET', 'PIMPINAN']), budgetController.getBudgets);
// POST /api/v1/budgets
router.post('/', checkRole(['PIMPINAN']), budgetController.createBudget);
// GET  /api/v1/budgets/:id
router.get('/:id', checkRole(['ADMIN_ASET', 'PIMPINAN']), budgetController.getBudgetById);
// PUT  /api/v1/budgets/:id
router.put('/:id', checkRole(['PIMPINAN']), budgetController.updateBudget);
// POST /api/v1/budgets/:id/absorb
router.post('/:id/absorb', checkRole(['ADMIN_ASET']), budgetController.recordAbsorption);

module.exports = router;
