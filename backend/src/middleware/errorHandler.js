const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[StaySync Global Error]:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  return error(res, message, statusCode, err.errors || null);
}

module.exports = errorHandler;
