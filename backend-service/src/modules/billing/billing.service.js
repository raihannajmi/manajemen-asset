const prisma = require('../../config/db');

class BillingService {
  
  // --- INVOICE (Sprint 5) ---

  async generateInvoice(requestId, adminId, { utilityCosts, manualVaNumber }) {
    const request = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { asset: true }
    });

    if (!request || request.status !== 'APPROVED') {
      throw new Error('Hanya pengajuan yang sudah di-approve yang dapat dibuatkan invoice.');
    }

    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({ where: { requestId } });
    if (existing) throw new Error('Invoice sudah pernah dibuat untuk pengajuan ini.');

    // Calculate duration in days (naive calculation for mockup)
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = new Date(request.endDatetime) - new Date(request.startDatetime);
    const days = Math.max(1, Math.ceil(diff / msPerDay));

    // Pricing from asset
    const pricePerDay = request.asset.pricingSchemeJson?.dailyRate || 1000000;
    const subtotal = days * pricePerDay;

    // Additional utilities
    let utilitySum = 0;
    if (utilityCosts && Array.isArray(utilityCosts)) {
      utilitySum = utilityCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    const taxAmount = (subtotal + utilitySum) * 0.11; // 11% PPN
    const totalAmount = subtotal + utilitySum + taxAmount;

    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 Days
    
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${issueDate.getFullYear()}${(issueDate.getMonth()+1).toString().padStart(2,'0')}-${(count+1).toString().padStart(4,'0')}`;

    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          requestId,
          invoiceNo,
          issueDate,
          dueDate,
          subtotal,
          utilityCostsJson: utilityCosts,
          taxAmount,
          totalAmount,
          manualVaNumber,
          status: 'UNPAID'
        }
      });

      await tx.statusHistory.create({
        data: {
          requestId,
          fromStatus: 'APPROVED',
          toStatus: 'INVOICE_GENERATED',
          changedBy: adminId,
          note: `Invoice ${invoiceNo} berhasil di-generate`
        }
      });

      await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: 'INVOICE_GENERATED' }
      });

      return invoice;
    });
  }

  async getInvoiceById(invoiceId) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        request: { include: { tenantUser: { select: { fullName: true, organization: true, email: true } }, asset: true } },
        payments: { orderBy: { transferDate: 'desc' } }
      }
    });
  }

  // --- PAYMENT (Sprint 6) ---

  async uploadPaymentProof(invoiceId, tenantId, { amount, transferDate, proofUrl }) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { request: true } });
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.request.tenantUserId !== tenantId) throw new Error('Unauthorized');
    if (invoice.status === 'PAID') throw new Error('Invoice is already paid');

    return prisma.payment.create({
      data: {
        invoiceId,
        payerUserId: tenantId,
        amount: parseFloat(amount),
        transferDate: new Date(transferDate),
        proofUrl,
        verificationStatus: 'PENDING'
      }
    });
  }

  async verifyPayment(paymentId, adminId, { status, note }) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { invoice: true } });
    if (!payment || payment.verificationStatus !== 'PENDING') throw new Error('Invalid payment for verification');

    if (!['VERIFIED', 'REJECTED'].includes(status)) throw new Error('Invalid status');

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          verificationStatus: status,
          verifiedByUserId: adminId,
          verifiedAt: new Date(),
          verificationNote: note
        }
      });

      if (status === 'VERIFIED') {
        // Mark invoice as PAID
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID' }
        });

        // Update rental request status
        await tx.rentalRequest.update({
          where: { id: payment.invoice.requestId },
          data: { status: 'ACTIVE_RENTAL' }
        });

        await tx.statusHistory.create({
          data: {
            requestId: payment.invoice.requestId,
            fromStatus: 'INVOICE_GENERATED',
            toStatus: 'ACTIVE_RENTAL',
            changedBy: adminId,
            note: `Pembayaran diverifikasi. Transaksi selesai dan sewa aktif.`
          }
        });
      }

      return updatedPayment;
    });
  }

  // --- CONTRACT (Sprint 6) ---

  async generateContract(requestId, adminId) {
    const request = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { invoice: true }
    });

    if (!request || request.status !== 'ACTIVE_RENTAL') {
      throw new Error('Kontrak hanya bisa dibuat jika pembayaran sudah lunas (ACTIVE_RENTAL).');
    }

    const count = await prisma.contract.count();
    const contractNo = `CTR-${new Date().getFullYear()}-${(count+1).toString().padStart(4,'0')}`;

    return prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          requestId,
          contractNo,
          startDate: request.startDatetime,
          endDate: request.endDatetime,
          contractValue: request.invoice?.totalAmount || 0,
          pdfUrl: 'https://placeholder.url/kontrak_final.pdf' // Mock PDF URL
        }
      });

      await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: 'CONTRACT_GENERATED' }
      });

      return contract;
    });
  }
}

module.exports = new BillingService();
