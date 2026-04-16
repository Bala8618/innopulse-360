const ApiError = require('../utils/ApiError');

module.exports = (...allowedRoles) => (req, _, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }

  next();
};
