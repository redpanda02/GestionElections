const AppError = require('../AppError');

class BusinessError extends AppError {
  constructor(code, message, data = null) {
    super(code, message, 422, data);
    this.name = 'BusinessError';
  }

  static parrainageExistant() {
    return new BusinessError(
      'PARRAINAGE_EXISTANT',
      'L\'électeur a déjà parrainé un candidat pour cette période'
    );
  }

  static periodeFermee() {
    return new BusinessError(
      'PERIODE_FERMEE',
      'La période de parrainage est actuellement fermée'
    );
  }

  static quotaDepasse() {
    return new BusinessError(
      'QUOTA_DEPASSE',
      'Le quota de parrainages pour ce candidat est atteint'
    );
  }
}

module.exports = BusinessError; 