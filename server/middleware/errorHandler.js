const multer = require('multer');

const normalizeError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(', '),
    };
  }

  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid value for ${error.path}`,
    };
  }

  if (error.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      message: 'Invalid authentication token',
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: 'Authentication token expired',
    };
  }

  if (error instanceof multer.MulterError) {
    return {
      statusCode: 400,
      message: error.message,
    };
  }

  return {
    statusCode: error.statusCode || error.status || 500,
    message: error.message || 'Internal server error',
  };
};

const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  const normalizedError = normalizeError(error);

  return res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = { errorHandler, notFound };
