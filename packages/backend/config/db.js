const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MongoDB URI not set. Skipping MongoDB connection.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Continuing without MongoDB for in-memory/platform APIs.');
  }
};
