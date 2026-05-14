const express = require('express');
const router = express.Router();
const DashboardController = require('./dashboard.controller');
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');

// Dashboard access for all authenticated users
router.get('/summary', 
  verifyToken, 
  DashboardController.getSummary
);

module.exports = router;
