const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

router.use(verifyToken);

// Hanya Pimpinan yang dapat mengakses keseluruhan CRUD Pengguna
router.get('/', checkRole(['PIMPINAN']), userController.getUsers);
router.get('/roles', checkRole(['PIMPINAN']), userController.getRoles);
router.get('/:id', checkRole(['PIMPINAN']), userController.getUserById);
router.put('/:id', checkRole(['PIMPINAN']), userController.updateUser);
router.delete('/:id', checkRole(['PIMPINAN']), userController.deleteUser);

module.exports = router;
