const express = require('express');
const router = express.Router();
const rentalController = require('./rental.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');
const validateRequest = require('../../middleware/validateRequest');
const { createRentalSchema, updateRentalSchema, actionNoteSchema, approveSchema } = require('../../shared/validators/rental.validation');

// All rental routes require authentication
router.use(verifyToken);

// Common Queries
router.get('/', rentalController.getRentals);
router.get('/:id', rentalController.getRentalById);

// Sprint 3: Tenant Actions
// Create draft request
router.post('/', checkRole(['PENYEWA']), validateRequest(createRentalSchema), rentalController.createDraft);
// Update draft/revision
router.put('/:id', checkRole(['PENYEWA']), validateRequest(updateRentalSchema), rentalController.updateDraft);
// Upload document
const { upload } = require('../../shared/utils/s3Uploader');
router.post(
  '/:id/documents', 
  checkRole(['PENYEWA']), 
  (req, res, next) => {
    req.uploadFolder = `rentals/${req.params.id}`;
    next();
  },
  upload.single('file'), 
  rentalController.uploadDocument
);
// Submit request
router.post('/:id/submit', checkRole(['PENYEWA']), rentalController.submitRequest);

// Sprint 4: Admin & Pimpinan Actions
// Verify request (Admin/Pimpinan -> PENDING_APPROVAL)
router.post('/:id/verify', checkRole(['ADMIN_ASET', 'PIMPINAN']), validateRequest(actionNoteSchema), rentalController.verifyRequest);
// Approve request (Pimpinan -> APPROVED/REJECTED/REVISION)
router.post('/:id/approve', checkRole(['PIMPINAN']), validateRequest(approveSchema), rentalController.approveRequest);

module.exports = router;
