const prisma = require('../../config/db');

class RentalService {
  // --- SPRINT 3: TENANT ACTIONS ---

  async createDraft(tenantUserId, data) {
    // Generate unique request number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.rentalRequest.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });
    const requestNo = `REQ-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    return prisma.rentalRequest.create({
      data: {
        requestNo,
        tenantUserId,
        assetId: data.assetId,
        eventName: data.eventName,
        startDatetime: new Date(data.startDatetime),
        endDatetime: new Date(data.endDatetime),
        participantCount: parseInt(data.participantCount),
        purpose: data.purpose,
        status: 'DRAFT',
      }
    });
  }

  async updateDraft(requestId, tenantUserId, data) {
    const request = await prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request || request.tenantUserId !== tenantUserId) throw new Error('Request not found');
    if (request.status !== 'DRAFT' && request.status !== 'REVISION') throw new Error('Cannot update request in current status');

    return prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        eventName: data.eventName,
        startDatetime: new Date(data.startDatetime),
        endDatetime: new Date(data.endDatetime),
        participantCount: parseInt(data.participantCount),
        purpose: data.purpose,
      }
    });
  }

  async uploadDocument(requestId, data) {
    // Delete existing document of same type for this request to prevent duplicates
    await prisma.rentalRequestDocument.deleteMany({
      where: {
        requestId,
        docType: data.docType
      }
    });

    return prisma.rentalRequestDocument.create({
      data: {
        requestId,
        docType: data.docType,
        fileUrl: data.fileUrl,
      }
    });
  }

  async submitRequest(requestId, tenantUserId) {
    const request = await prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request || request.tenantUserId !== tenantUserId) throw new Error('Request not found');
    if (request.status !== 'DRAFT' && request.status !== 'REVISION') throw new Error('Invalid status for submission');

    // Validate availability (prevent double booking)
    const overlapping = await prisma.rentalRequest.findFirst({
      where: {
        assetId: request.assetId,
        status: { in: ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED'] },
        id: { not: requestId },
        AND: [
          { startDatetime: { lt: request.endDatetime } },
          { endDatetime: { gt: request.startDatetime } }
        ]
      }
    });

    if (overlapping) {
      throw new Error('Aset sudah di-booking pada tanggal tersebut.');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: 'SUBMITTED', submittedAt: new Date() }
      });

      await tx.statusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: 'SUBMITTED',
          changedBy: tenantUserId,
          note: 'Penyewa mensubmit pengajuan'
        }
      });

      return updated;
    });
  }

  // --- SPRINT 4: ADMIN & PIMPINAN ACTIONS ---

  async verifyRequest(requestId, adminId, note) {
    const request = await prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'SUBMITTED') throw new Error('Invalid request for verification');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: 'PENDING_APPROVAL' }
      });

      await tx.statusHistory.create({
        data: {
          requestId,
          fromStatus: 'SUBMITTED',
          toStatus: 'PENDING_APPROVAL',
          changedBy: adminId,
          note: note || 'Dokumen diverifikasi oleh Admin'
        }
      });

      // Update documents verification status (assuming all verified)
      await tx.rentalRequestDocument.updateMany({
        where: { requestId },
        data: { verifiedBy: adminId, verifiedAt: new Date() }
      });

      return updated;
    });
  }

  async approveRequest(requestId, approverId, action, note) {
    if (!['APPROVED', 'REJECTED', 'REVISION'].includes(action)) throw new Error('Invalid action');
    
    const request = await prisma.rentalRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING_APPROVAL') throw new Error('Invalid request for approval');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: action }
      });

      await tx.approval.create({
        data: {
          requestId,
          approverUserId: approverId,
          action,
          note
        }
      });

      await tx.statusHistory.create({
        data: {
          requestId,
          fromStatus: 'PENDING_APPROVAL',
          toStatus: action,
          changedBy: approverId,
          note
        }
      });

      return updated;
    });
  }

  // --- QUERIES ---

  async getRentals(filters = {}) {
    const where = {};
    if (filters.tenantUserId) where.tenantUserId = filters.tenantUserId;
    if (filters.status) where.status = filters.status;

    return prisma.rentalRequest.findMany({
      where,
      include: {
        asset: true,
        documents: true,
        tenantUser: { select: { id: true, fullName: true, email: true, organization: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRentalById(id) {
    return prisma.rentalRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        documents: true,
        approvals: { include: { approver: { select: { fullName: true } } }, orderBy: { actedAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        tenantUser: { select: { id: true, fullName: true, email: true, phone: true, organization: true } }
      }
    });
  }
}

module.exports = new RentalService();
