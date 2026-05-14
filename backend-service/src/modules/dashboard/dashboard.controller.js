const DashboardService = require('./dashboard.service');

class DashboardController {
  async getSummary(req, res) {
    try {
      const { period } = req.query;
      const summary = await DashboardService.getSummary(req.user);
      const analytics = await DashboardService.getAnalytics(period || 'MONTHLY');
      
      res.json({
        ...summary,
        analytics
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DashboardController();
