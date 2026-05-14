const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// --- Invoices ---
// Get Invoice details
router.get('/invoices/:id', billingController.getInvoiceById);

// Generate invoice (relates to rental request ID)
router.post('/rentals/:id/invoices', checkRole(['ADMIN_ASET', 'PIMPINAN']), billingController.generateInvoice);

// --- Payments ---
// Tenant uploads payment proof for an invoice
const { upload } = require('../../shared/utils/s3Uploader');
router.post(
  '/invoices/:id/payments', 
  checkRole(['PENYEWA']), 
  (req, res, next) => {
    req.uploadFolder = `payments/${req.params.id}`;
    next();
  },
  upload.single('file'),
  billingController.uploadPaymentProof
);

// Admin/Pimpinan verifies payment
router.post('/payments/:id/verify', checkRole(['ADMIN_ASET', 'PIMPINAN']), billingController.verifyPayment);

// --- Contracts ---
// Generate contract for an active rental
router.post('/rentals/:id/contracts', checkRole(['ADMIN_ASET', 'PIMPINAN']), billingController.generateContract);

module.exports = router;
