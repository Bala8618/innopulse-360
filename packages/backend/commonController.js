const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

exports.myNotifications = asyncHandler(async (req, res) => {
  const data = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ data });
});
