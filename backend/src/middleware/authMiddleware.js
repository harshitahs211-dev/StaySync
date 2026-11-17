const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'Invalid or expired authentication token', 401);
  }

  req.user = decoded;
  next();
}

module.exports = {
  authenticate
};
