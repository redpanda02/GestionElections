class ApiError extends Error {
  constructor(statusCode, translationKey, errors = null) {
    super(translationKey);
    this.statusCode = statusCode;
    this.translationKey = translationKey;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(translationKey, errors = null) {
    return new ApiError(400, translationKey, errors);
  }

  static unauthorized(translationKey = 'auth.unauthorized') {
    return new ApiError(401, translationKey);
  }

  static forbidden(translationKey = 'auth.forbidden') {
    return new ApiError(403, translationKey);
  }

  static notFound(translationKey = 'general.notFound') {
    return new ApiError(404, translationKey);
  }

  static conflict(translationKey, errors = null) {
    return new ApiError(409, translationKey, errors);
  }

  static internal(translationKey = 'general.serverError') {
    return new ApiError(500, translationKey);
  }
}

module.exports = ApiError; 