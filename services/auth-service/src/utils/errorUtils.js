class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const logError = (err) => {
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    statusCode: err.statusCode,
  });
};

const isOperationalError = (error) => {
  if (error.isOperational) {
    return true;
  }
  return false;
};

module.exports = {
  AppError,
  logError,
  isOperationalError,
};
