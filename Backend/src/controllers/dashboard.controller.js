const StatistiquesService = require('../services/statistiques.service');

class DashboardController {
  async getTableauBord(req, res, next) {
    try {
      const stats = await StatistiquesService.getTableauBord();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsCandidatDetail(req, res, next) {
    try {
      const { candidatId } = req.params;
      const stats = await StatistiquesService.getStatsCandidatDetail(candidatId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController(); 