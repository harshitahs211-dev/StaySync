const { error } = require('../utils/response');

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

module.exports = {
  requireRole
};
