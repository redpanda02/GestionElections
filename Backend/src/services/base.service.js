const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');

class BaseService {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des ${this.modelName}s:`, error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);
      if (!item) {
        throw new AppError(`${this.modelName} non trouvé`, 404);
      }
      return item;
    } catch (error) {
      logger.error(`Erreur lors de la récupération du ${this.modelName}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      logger.error(`Erreur lors de la création du ${this.modelName}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const item = await this.findById(id);
      return await item.update(data);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du ${this.modelName}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const item = await this.findById(id);
      await item.destroy();
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la suppression du ${this.modelName}:`, error);
      throw error;
    }
  }

  async findOne(options = {}) {
    try {
      const item = await this.model.findOne(options);
      if (!item) {
        throw new AppError(`${this.modelName} non trouvé`, 404);
      }
      return item;
    } catch (error) {
      logger.error(`Erreur lors de la recherche du ${this.modelName}:`, error);
      throw error;
    }
  }

  async count(options = {}) {
    try {
      return await this.model.count(options);
    } catch (error) {
      logger.error(`Erreur lors du comptage des ${this.modelName}s:`, error);
      throw error;
    }
  }
}

module.exports = BaseService; 