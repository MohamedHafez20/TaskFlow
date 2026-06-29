const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  let status = res.statusCode === 200 ? 500 : res.statusCode;

  // Map operational validation and cast errors to 400
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  }

  res.status(status).json({ message: err.message || 'Server error' });
};

module.exports = errorHandler;
