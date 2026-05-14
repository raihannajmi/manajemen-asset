const express = require('express');
const router = express.Router();
const rentalController = require('./rental.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

// All rental routes require authentication
router.use(verifyToken);

// Common Queries
router.get('/', rentalController.getRentals);
router.get('/:id', rentalController.getRentalById);

// Sprint 3: Tenant Actions
// Create draft request
router.post('/', checkRole(['PENYEWA']), rentalController.createDraft);
// Update draft/revision
router.put('/:id', checkRole(['PENYEWA']), rentalController.updateDraft);
// Upload document
router.post('/:id/documents', checkRole(['PENYEWA']), rentalController.uploadDocument);
// Submit request
router.post('/:id/submit', checkRole(['PENYEWA']), rentalController.submitRequest);

// Sprint 4: Admin & Pimpinan Actions
// Verify request (Admin -> PENDING_APPROVAL)
router.post('/:id/verify', checkRole(['ADMIN_ASET']), rentalController.verifyRequest);
// Approve request (Pimpinan -> APPROVED/REJECTED/REVISION)
router.post('/:id/approve', checkRole(['PIMPINAN']), rentalController.approveRequest);

module.exports = router;
