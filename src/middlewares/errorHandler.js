const ErrorResponse = require('../utils/errorResponse');

module.exports = (err, req, res, next) => {
  console.error(err);
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404);
  }
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });
};
