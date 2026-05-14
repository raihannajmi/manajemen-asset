const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authJwt');
const { checkRole } = require('../../middleware/rbac');
const prisma = require('../../config/db');

const requireAdminOrPimpinan = [verifyToken, checkRole(['ADMIN_ASET', 'PIMPINAN'])];

/**
 * GET /api/v1/orders
 * Returns all rental requests with rich includes for Order Center.
 * Supports: ?status=, ?search=, ?startDate=, ?endDate=
 */
router.get('/', requireAdminOrPimpinan, async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { requestNo: { contains: search, mode: 'insensitive' } },
        { eventName: { contains: search, mode: 'insensitive' } },
        { tenantUser: { fullName: { contains: search, mode: 'insensitive' } } },
        { tenantUser: { organization: { contains: search, mode: 'insensitive' } } },
        { asset: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.rentalRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          tenantUser: { select: { id: true, fullName: true, email: true, organization: true } },
          asset: { select: { id: true, name: true, assetCode: true, location: true } },
          invoice: { select: { id: true, invoiceNo: true, totalAmount: true, status: true } },
          contract: { select: { id: true, contractNo: true, pdfUrl: true } },
          documents: { select: { id: true, docType: true } },
          _count: { select: { statusHistory: true } },
        }
      }),
      prisma.rentalRequest.count({ where })
    ]);

    res.json({
      data: orders,
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

/**
 * GET /api/v1/orders/:id/timeline
 * Returns the complete audit trail for a single order.
 * Combines StatusHistory + AuditLog entries sorted by time.
 */
router.get('/:id/timeline', requireAdminOrPimpinan, async (req, res) => {
  try {
    const { id } = req.params;

    // Get rental request first to verify it exists
    const rental = await prisma.rentalRequest.findUnique({
      where: { id },
      include: {
        tenantUser: { select: { fullName: true, email: true } },
        asset: { select: { name: true } },
      }
    });
    if (!rental) return res.status(404).json({ message: 'Order not found' });

    // Get all status history for this order
    const statusHistory = await prisma.statusHistory.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        changedByUser: { select: { fullName: true, role: true } }
      }
    });

    // Get ALL audit logs related to this rental request (by entityId OR by associated invoice/contract)
    const [invoices, contracts] = await Promise.all([
      prisma.invoice.findMany({ where: { requestId: id }, select: { id: true } }),
      prisma.contract.findMany({ where: { requestId: id }, select: { id: true } }),
    ]);

    const relatedEntityIds = [
      id,
      ...invoices.map(i => i.id),
      ...contracts.map(c => c.id),
    ];

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: { in: relatedEntityIds } },
      orderBy: { createdAt: 'asc' },
    });

    // Merge and sort everything by createdAt
    const timelineEntries = [
      ...statusHistory.map(sh => ({
        type: 'STATUS_CHANGE',
        id: sh.id,
        action: sh.toStatus,
        actor: sh.changedByUser?.fullName || 'System',
        actorRole: sh.changedByUser?.role || 'SYSTEM',
        note: sh.note,
        createdAt: sh.createdAt,
        meta: { fromStatus: sh.fromStatus, toStatus: sh.toStatus }
      })),
      ...auditLogs.map(al => ({
        type: 'AUDIT',
        id: al.id,
        action: al.action,
        actor: null, // will be resolved separately if needed
        actorUserId: al.actorUserId,
        module: al.module,
        entityType: al.entityType,
        note: null,
        createdAt: al.createdAt,
        meta: { before: al.beforeJson, after: al.afterJson, ipAddress: al.ipAddress }
      }))
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      order: {
        id: rental.id,
        requestNo: rental.requestNo,
        status: rental.status,
        tenantName: rental.tenantUser.fullName,
        assetName: rental.asset.name,
        createdAt: rental.createdAt,
      },
      timeline: timelineEntries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
