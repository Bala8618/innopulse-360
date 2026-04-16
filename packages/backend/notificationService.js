const Notification = require('../models/Notification');

const sendNotification = async (io, recipient, title, message, type = 'info', link = null) => {
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link
  });

  // Emit to the specific user if connected
  io.to(recipient.toString()).emit('notification', notification);

  return notification;
};

module.exports = { sendNotification };