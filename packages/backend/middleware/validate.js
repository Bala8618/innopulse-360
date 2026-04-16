const { validationResult } = require('express-validator');

module.exports = function validate(req, _, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ statusCode: 422, message: errors.array().map((e) => e.msg).join(', ') });
  }

  next();
};
