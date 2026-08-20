const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  const defaultError = {
    error: {
      message: 'An internal error occurred',
      type: 'server_error',
      param: null,
      code: 'internal_error'
    }
  };
  
  if (err.response && err.response.status && err.response.data) {
    const status = err.response.status || 500;
    return res.status(status).json({
      error: {
        message: err.response.data.error?.message || err.message,
        type: err.response.data.error?.type || 'api_error',
        param: err.response.data.error?.param || null,
        code: err.response.data.error?.code || 'provider_error'
      }
    });
  }
  
  if (err.status && err.message) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        type: err.type || 'error',
        param: err.param || null,
        code: err.code || 'error'
      }
    });
  }
  
  res.status(500).json(defaultError);
};

module.exports = { errorHandler };
