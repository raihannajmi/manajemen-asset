const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/authJwt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
