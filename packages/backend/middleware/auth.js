const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

module.exports = async function auth(req, _, next) {
  try {
    const token = req.cookies[process.env.COOKIE_NAME || 'innopulse_token'];
    if (!token) return next(new ApiError(401, 'Unauthorized'));

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new ApiError(401, 'User not found'));

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
