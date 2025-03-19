const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');

class BaseController {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await this.model.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        status: 'success',
        results: rows.length,
        page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        data: rows
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération des ${this.modelName}s:`, error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const doc = await this.model.findByPk(req.params.id);

      if (!doc) {
        return next(new AppError(`${this.modelName} non trouvé`, 404));
      }

      res.status(200).json({
        status: 'success',
        data: doc
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération du ${this.modelName}:`, error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const doc = await this.model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: doc
      });
    } catch (error) {
      logger.error(`Erreur lors de la création du ${this.modelName}:`, error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const doc = await this.model.findByPk(req.params.id);

      if (!doc) {
        return next(new AppError(`${this.modelName} non trouvé`, 404));
      }

      await doc.update(req.body);

      res.status(200).json({
        status: 'success',
        data: doc
      });
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du ${this.modelName}:`, error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const doc = await this.model.findByPk(req.params.id);

      if (!doc) {
        return next(new AppError(`${this.modelName} non trouvé`, 404));
      }

      await doc.destroy();

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      logger.error(`Erreur lors de la suppression du ${this.modelName}:`, error);
      next(error);
    }
  }
}

module.exports = BaseController; 