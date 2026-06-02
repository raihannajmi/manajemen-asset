const reportService = require('./report.service');

class ReportController {
  async getRevenueReport(req, res) {
    try {
      const data = await reportService.getRevenueReport(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getExpensesReport(req, res) {
    try {
      const data = await reportService.getExpensesReport(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBudgetVsActualReport(req, res) {
    try {
      const data = await reportService.getBudgetVsActualReport(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOccupancyReport(req, res) {
    try {
      const data = await reportService.getOccupancyReport(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async exportReport(req, res) {
    try {
      const { type, fiscalYear } = req.query;
      const year = parseInt(fiscalYear) || new Date().getFullYear();
      let columns = [];
      let rows = [];
      let filename = `laporan-${type}-${year}.csv`;

      if (type === 'revenue') {
        const report = await reportService.getRevenueReport({ fiscalYear: year });
        columns = ['Bulan', 'Pendapatan Internal (Rupiah)', 'Pendapatan Eksternal (Rupiah)', 'Total (Rupiah)'];
        rows = report.monthlyData.map(m => [
          m.monthName,
          m.internal,
          m.external,
          m.total,
        ]);
      } else if (type === 'expenses') {
        const report = await reportService.getExpensesReport({ fiscalYear: year });
        // Ambil kategori dinamis
        const breakdownKeys = Object.keys(report.monthlyData[0]?.breakdown || {});
        columns = ['Bulan', ...breakdownKeys.map(k => `Beban ${k} (Rupiah)`), 'Total Beban (Rupiah)'];
        rows = report.monthlyData.map(m => [
          m.monthName,
          ...breakdownKeys.map(k => m.breakdown[k] || 0),
          m.total,
        ]);
      } else if (type === 'budget') {
        const report = await reportService.getBudgetVsActualReport({ fiscalYear: year });
        columns = ['Kode Unit Usaha', 'Nama Unit Usaha', 'Pagu Dialokasikan (Rupiah)', 'Total Penyerapan (Rupiah)', 'Sisa Anggaran (Rupiah)', 'Persentase Penyerapan (%)'];
        rows = report.items.map(i => [
          i.unitUsahaCode,
          i.unitUsahaName,
          i.allocatedQuota,
          i.totalAbsorbed,
          i.remaining,
          `${i.absorptionRate}%`,
        ]);
      } else if (type === 'occupancy') {
        const report = await reportService.getOccupancyReport({ fiscalYear: year });
        columns = ['Bulan', 'Jumlah Aset Tersewa', 'Total Aset', 'Tingkat Okupansi (%)'];
        rows = report.monthlyData.map(m => [
          m.monthName,
          m.rentedCount,
          report.totalAssets,
          `${m.occupancyRate}%`,
        ]);
      } else {
        return res.status(400).json({ message: 'Tipe laporan tidak valid. Pilih antara revenue, expenses, budget, atau occupancy.' });
      }

      const csvContent = reportService.toCsv(columns, rows);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReportController();
