const logger = require('../config/logger.advanced');
const AppError = require('../errors/AppError');

class ErrorHandler {
  static async handleError(err, req, res, next) {
    const error = ErrorHandler.normalizeError(err);

    // Log de l'erreur
    if (!error.isOperational) {
      logger.error('Erreur non opérationnelle détectée', {
        error: error.toJSON(),
        path: req.path,
        method: req.method,
        body: req.body,
        user: req.user?.id
      });
    } else {
      logger.warn('Erreur opérationnelle', {
        error: error.toJSON(),
        path: req.path
      });
    }

    // Notification des erreurs critiques
    if (error.statusCode === 500) {
      await ErrorHandler.notifyCriticalError(error, req);
    }

    // Réponse au client
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        data: error.data,
        timestamp: error.timestamp
      }
    });
  }

  static normalizeError(err) {
    if (err instanceof AppError) {
      return err;
    }

    // Erreurs Sequelize
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      return new ValidationError('Erreur de validation des données', errors);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      return new ValidationError('Violation de contrainte unique', err.errors);
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
      return new AuthenticationError('Token invalide');
    }

    if (err.name === 'TokenExpiredError') {
      return new AuthenticationError('Token expiré');
    }

    // Erreur par défaut
    return new AppError(
      'INTERNAL_ERROR',
      'Une erreur interne est survenue',
      500
    );
  }

  static async notifyCriticalError(error, req) {
    try {
      // Enregistrement dans la base de données
      await sequelize.models.ErrorLog.create({
        code: error.code,
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // Notification par email si en production
      if (process.env.NODE_ENV === 'production') {
        await notificationService.sendEmail(
          process.env.ADMIN_EMAIL,
          'Erreur critique détectée',
          'error-notification',
          { error: error.toJSON(), request: req }
        );
      }
    } catch (notifyError) {
      logger.error('Erreur lors de la notification', { error: notifyError });
    }
  }
}

module.exports = ErrorHandler; 