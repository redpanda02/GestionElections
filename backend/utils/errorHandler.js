// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Main error handling middleware
  const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      // Development error response with full details
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } else {
      // Production error response
      if (err.isOperational) {
        // Operational, trusted error: send message to client
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
          status: 'error',
          message: 'Une erreur interne est survenue'
        });
      }
    }
  };
  
  // Handle specific MongoDB errors
  const handleMongoError = (err) => {
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0];
      return new APIError(`La valeur '${field}' existe déjà`, 400);
    }
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      const errors = Object.values(err.errors).map(el => el.message);
      return new APIError(`Données invalides: ${errors.join('. ')}`, 400);
    }
    return err;
  };
  
  // Handle JWT errors
  const handleJWTError = () => {
    return new APIError('Token invalide. Veuillez vous reconnecter', 401);
  };
  
  const handleJWTExpiredError = () => {
    return new APIError('Votre session a expiré. Veuillez vous reconnecter', 401);
  };
  
  module.exports = {
    APIError,
    errorHandler,
    handleMongoError,
    handleJWTError,
    handleJWTExpiredError
  };