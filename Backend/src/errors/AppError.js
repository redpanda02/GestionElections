class AppError extends Error {
  constructor(code, message, statusCode = 500, data = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date();
    this.isOperational = true; // Erreur opérationnelle vs programmation

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

module.exports = AppError; 