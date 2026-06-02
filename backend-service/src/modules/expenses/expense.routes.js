const express = require('express');
const router = express.Router();
const expenseController = require('./expense.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// ─── Kategori Beban ───────────────────────────────────────────────────────────
// GET  /api/v1/expenses/categories
router.get('/categories', checkRole(['ADMIN_ASET', 'PIMPINAN']), expenseController.getCategories);
// POST /api/v1/expenses/categories
router.post('/categories', checkRole(['ADMIN_ASET']), expenseController.createCategory);

// ─── Ringkasan (harus di atas /:id agar tidak terbentur param) ─────────────────
// GET  /api/v1/expenses/summary
router.get('/summary', checkRole(['ADMIN_ASET', 'PIMPINAN']), expenseController.getSummary);

// ─── CRUD Beban Operasional ───────────────────────────────────────────────────
// GET  /api/v1/expenses
router.get('/', checkRole(['ADMIN_ASET', 'PIMPINAN']), expenseController.getExpenses);
// POST /api/v1/expenses
router.post('/', checkRole(['ADMIN_ASET']), expenseController.createExpense);
// GET  /api/v1/expenses/:id
router.get('/:id', checkRole(['ADMIN_ASET', 'PIMPINAN']), expenseController.getExpenseById);
// PUT  /api/v1/expenses/:id
router.put('/:id', checkRole(['ADMIN_ASET']), expenseController.updateExpense);
// DELETE /api/v1/expenses/:id
router.delete('/:id', checkRole(['ADMIN_ASET']), expenseController.deleteExpense);

module.exports = router;
