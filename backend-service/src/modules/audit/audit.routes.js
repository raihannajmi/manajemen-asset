const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');
const prisma = require('../../config/db');

// GET /api/v1/audit-logs
// Admin only - with pagination, search, and filter
router.get('/', verifyToken, checkRole(['ADMIN_ASET', 'PIMPINAN']), async (req, res) => {
  try {
    const { page = 1, limit = 30, module, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (module) where.module = module;
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { actorUserId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
