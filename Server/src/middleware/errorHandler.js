import AppError from '../utils/AppError.js'

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field'
  const value = err.keyValue ? err.keyValue[field] : ''
  const message = `An entry with this ${field} ('${value}') already exists. Please use another value.`
  return new AppError(message, 409)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message)
  const message = `Validation failed: ${errors.join('. ')}`
  return new AppError(message, 400, errors)
}

const handleDBConnectionError = (err) => {
  console.error('💥 Database Connection/Buffering Error intercepted:', err.message)
  return new AppError('Database service temporarily unavailable. Please try again.', 503)
}

const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401)

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401)

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = { ...err, message: err.message, name: err.name, code: err.code }
  error.statusCode = err.statusCode || 500
  error.status = err.status || 'error'

  // Identify specific database/network error conditions
  if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoTimeoutError' ||
    (err.message && err.message.includes('buffering timed out')) ||
    (err.message && err.message.includes('before initial connection'))
  ) {
    error = handleDBConnectionError(err)
  } else if (err.name === 'CastError') {
    error = handleCastErrorDB(err)
  } else if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err)
  } else if (err.name === 'ValidationError') {
    error = handleValidationErrorDB(err)
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError()
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError()
  }

  // Technical server logging
  if (error.statusCode >= 500) {
    console.error('💥 [Server Error]', {
      name: err.name,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
    })
  }

  res.status(error.statusCode).json({
    status: error.status || (error.statusCode >= 500 ? 'error' : 'fail'),
    message: error.message || 'Something went wrong on the server.',
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && error.statusCode >= 500 && {
      stack: err.stack,
    }),
  })
}

export default errorHandler
