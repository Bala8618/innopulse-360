module.exports = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  if (error && typeof error.code === 'string' && error.code.startsWith('ER_')) {
    statusCode = error.statusCode || 503;
    message = 'Database error: configure MySQL schema/data and retry.';
  }

  if (error && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
    statusCode = error.statusCode || 503;
    message = 'Database connection failed: start MySQL and verify MYSQL_HOST/MYSQL_PORT/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE.';
  }

  if (process.env.NODE_ENV !== 'production') {
    return res.status(statusCode).json({
      message,
      code: error.code || undefined,
      stack: error.stack
    });
  }

  return res.status(statusCode).json({ message });
};
